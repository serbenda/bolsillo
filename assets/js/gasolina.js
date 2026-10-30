import { COMBUSTIBLES, expandir, cercanas, centroCodigoPostal } from './carburantes.js';

const $ = (id) => document.getElementById(id);
const FICHERO = new URL('../../data/gasolina.json', import.meta.url);
const MAXIMO_LISTA = 25;

const euros = (p) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(p);
const km = (d) => (d < 1 ? `${Math.round(d * 1000)} m` : `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(d)} km`);
const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Preferencias del visitante (solo en su navegador)
const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.${k}`); } catch { return null; } };

let estaciones = [];
let centro = null; // { lat, lon, etiqueta }
let mapa = null;
let capa = null;

function avisar(texto) {
  const m = $('mensaje');
  m.textContent = texto ?? '';
  m.hidden = !texto;
}

function combustible() { return $('combustible').value; }
function radio() { return Number(document.querySelector('input[name=radio]:checked').value); }

function prepararFiltros() {
  const select = $('combustible');
  for (const [clave, { nombre }] of Object.entries(COMBUSTIBLES)) {
    select.add(new Option(nombre, clave));
  }
  const c = leer('combustible');
  if (c && COMBUSTIBLES[c]) select.value = c;
  const r = leer('radio');
  const opcion = r && document.querySelector(`input[name=radio][value="${r}"]`);
  if (opcion) opcion.checked = true;
  const cp = leer('cp');
  if (cp) $('cp').value = cp;

  select.addEventListener('change', () => { guardar('combustible', combustible()); pintar(); });
  document.querySelectorAll('input[name=radio]').forEach((i) =>
    i.addEventListener('change', () => { guardar('radio', String(radio())); pintar(); })
  );
}

function clasePrecio(precio, min, max) {
  if (max - min < 0.005) return 'barata';
  const t = (precio - min) / (max - min);
  return t < 1 / 3 ? 'barata' : t < 2 / 3 ? 'media' : 'cara';
}

function pintarMapa(lista, min, max) {
  if (!window.L) { $('mapa').hidden = true; return; }
  if (!mapa) {
    mapa = L.map('mapa', { scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; colaboradores de <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa);
    capa = L.layerGroup().addTo(mapa);
  }
  capa.clearLayers();
  const c = combustible();
  L.circleMarker([centro.lat, centro.lon], { radius: 7, weight: 3, color: '#2b59c3', fillOpacity: 0.2 })
    .bindTooltip('Tú').addTo(capa);
  const colores = { barata: '#1d8a5b', media: '#c98e0c', cara: '#b42318' };
  lista.forEach((e, i) => {
    L.circleMarker([e.lat, e.lon], {
      radius: i === 0 ? 10 : 7,
      weight: 2,
      color: '#ffffff',
      fillColor: colores[clasePrecio(e[c], min, max)],
      fillOpacity: 0.95,
    })
      .bindPopup(`<strong>${escapar(e.rotulo)}</strong><br>${euros(e[c])} €/l<br>${escapar(e.direccion)}`)
      .addTo(capa);
  });
  const puntos = [[centro.lat, centro.lon], ...lista.map((e) => [e.lat, e.lon])];
  mapa.fitBounds(puntos, { padding: [24, 24], maxZoom: 15 });
}

function pintar() {
  if (!centro || !estaciones.length) return;
  const c = combustible();
  const r = radio();
  const todas = cercanas(estaciones, centro, r, c);
  const nombre = COMBUSTIBLES[c].nombre;

  if (!todas.length) {
    $('titular').textContent = `No hay gasolineras con ${nombre.toLowerCase()} a menos de ${r} km.`;
    $('entradilla').textContent = 'Prueba a ampliar la distancia o a elegir otro combustible.';
    $('resumen').hidden = true;
    $('resultados').hidden = true;
    return;
  }

  const lista = todas.slice(0, MAXIMO_LISTA);
  const precios = todas.map((e) => e[c]);
  const min = Math.min(...precios);
  const max = Math.max(...precios);
  const mejor = todas[0];

  $('titular').textContent = `La más barata a menos de ${r} km: ${mejor.rotulo || 'sin nombre'}, a ${euros(mejor[c])} €/l.`;
  $('entradilla').textContent = `${nombre} cerca ${centro.etiqueta}. A ${km(mejor.km)}, en ${mejor.direccion}.`;

  const ahorro50 = (max - min) * 50;
  $('resumen').innerHTML = `
    <span><strong>${todas.length}</strong> gasolineras</span>
    <span>Entre <strong>${euros(min)}</strong> y <strong>${euros(max)}</strong> €/l</span>
    ${ahorro50 >= 0.5 ? `<span>En un depósito de 50 l ahorras hasta <strong>${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(ahorro50)}</strong></span>` : ''}`;
  $('resumen').hidden = false;
  $('resultados').hidden = false;

  $('lista').innerHTML = lista
    .map((e) => {
      const clase = clasePrecio(e[c], min, max);
      const destino = `https://www.google.com/maps/dir/?api=1&destination=${e.lat},${e.lon}`;
      return `
        <li class="estacion">
          <span class="precio ${clase}">${euros(e[c])}<small>€/l</small></span>
          <div>
            <h3>${escapar(e.rotulo || 'Sin nombre')}</h3>
            <p>${escapar(e.direccion)}, ${escapar(e.municipio)}</p>
            <p class="meta"><span>A ${km(e.km)}</span><span>${escapar(e.horario)}</span></p>
          </div>
          <a class="llegar" href="${destino}" target="_blank" rel="noopener">Cómo llegar</a>
        </li>`;
    })
    .join('');

  pintarMapa(lista, min, max);
}

function usarUbicacion() {
  if (!navigator.geolocation) {
    avisar('Tu navegador no permite compartir la ubicación. Busca por código postal.');
    return;
  }
  avisar('Buscando tu ubicación…');
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      avisar('');
      centro = { lat: pos.coords.latitude, lon: pos.coords.longitude, etiqueta: 'de ti' };
      pintar();
    },
    () => avisar('No hemos podido obtener tu ubicación. Busca por código postal.'),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

function buscarCodigoPostal(ev) {
  ev.preventDefault();
  const cp = $('cp').value.trim();
  if (!/^\d{5}$/.test(cp)) {
    avisar('Escribe un código postal de 5 cifras, por ejemplo 28100.');
    return;
  }
  const c = centroCodigoPostal(estaciones, cp);
  if (!c) {
    avisar(`No hay gasolineras registradas en el ${cp}. Prueba con el código postal de un municipio cercano o usa tu ubicación.`);
    return;
  }
  avisar('');
  guardar('cp', cp);
  centro = { lat: c.lat, lon: c.lon, etiqueta: `del ${cp} (${c.municipio})` };
  pintar();
}

async function iniciar() {
  prepararFiltros();
  $('ubicacion').addEventListener('click', usarUbicacion);
  $('buscador').addEventListener('submit', buscarCodigoPostal);

  try {
    const r = await fetch(FICHERO, { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    const datos = await r.json();
    estaciones = expandir(datos);
    if (datos.fecha) {
      const f = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short' });
      $('actualizado').textContent = `Precios del ${f.format(new Date(datos.fecha))}.`;
    }
  } catch {
    avisar('Los precios de carburantes no están disponibles ahora mismo. Vuelve a intentarlo en un rato.');
    document.querySelectorAll('#buscador button, #buscador input').forEach((el) => (el.disabled = true));
  }
}

iniciar();
