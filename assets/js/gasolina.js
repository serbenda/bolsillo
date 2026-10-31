import { COMBUSTIBLES, expandir, cercanas, centroCodigoPostal, provinciasCercanas, abierta, ahoraEnEspana, tendencia } from './carburantes.js';
import { tr, idioma, numero, euros as eurosMoneda, formato, LOCALE } from './idioma.js';

const $ = (id) => document.getElementById(id);
const DATOS = new URL('../../data/', import.meta.url);
const RADIO_MAXIMO = 25; // se cargan las provincias para el radio mayor y así cambiarlo es instantáneo
const MAXIMO_LISTA = 25;
const HORAS_ANTIGUEDAD = 14; // el Ministerio publica varias veces al día

const euros = (p) => numero(p, 3);
const km = (d) => (d < 1 ? `${Math.round(d * 1000)} m` : `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(d)} km`);

// Nombre de cada combustible con su artículo («la gasolina 95», «el diésel»)
const COMBUSTIBLES_EN = { g95: '95 petrol', g98: '98 petrol', diesel: 'Diesel', dieselPlus: 'Premium diesel', glp: 'LPG (autogas)' };
const ARTICULO = { g95: 'la', g98: 'la', diesel: 'el', dieselPlus: 'el', glp: 'el' };
const nombreCombustible = (c) => (idioma === 'en' ? COMBUSTIBLES_EN[c] : COMBUSTIBLES[c].nombre);
const conArticulo = (c) => tr(`${ARTICULO[c]} ${COMBUSTIBLES[c].nombre.toLowerCase()}`.replace('glp', 'GLP'), COMBUSTIBLES_EN[c].replace(/^\w/, (x) => x.toLowerCase()).replace('lpg', 'LPG'));

/** Horario del Ministerio («L-V: 07:00-22:00») en el idioma de la página. */
const DIAS_EN = { L: 'Mon', M: 'Tue', X: 'Wed', J: 'Thu', V: 'Fri', S: 'Sat', D: 'Sun' };
const horarioTexto = (h) =>
  idioma === 'en'
    ? String(h).replace(/\b([LMXJVSD])(?=[-:,\s])/g, (d) => DIAS_EN[d]).replace(/\b24H\b/gi, '24h').replace(/ y /g, ' and ')
    : String(h);
const escapar = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Preferencias del visitante (solo en su navegador)
const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.${k}`); } catch { return null; } };

let indice = null; // fecha, medias y caja de cada provincia
const cargadas = new Map(); // provincia → estaciones
let estaciones = [];
let centro = null; // { lat, lon, etiqueta }

async function json(ruta) {
  const r = await fetch(new URL(ruta, DATOS), { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${ruta}: ${r.status}`);
  return r.json();
}

const historicos = new Map(); // provincia → serie diaria de medias

async function historicoDe(prov) {
  if (!historicos.has(prov)) {
    historicos.set(prov, json(`gasolina/historico/${prov}.json`).catch(() => []));
  }
  return historicos.get(prov);
}

const centimos = (x) => new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(Math.abs(x) * 100);
const FORMATO_DIA = formato({ day: 'numeric', month: 'long', timeZone: 'UTC' });
const diaCorto = (f) => FORMATO_DIA.format(new Date(`${f}T12:00:00Z`));

async function pintarTendencia(prov, c) {
  const bloque = $('bloque-tendencia');
  const serie = await historicoDe(prov);
  const nombreProv = indice?.provincias?.[prov]?.nombre ?? tr('tu provincia', 'your province');
  const combustibleTxt = conArticulo(c);
  const t = tendencia(serie, c);
  if (!serie.length) { bloque.hidden = true; return; }
  if (!t) {
    $('tendencia-frase').textContent = tr(`Empezamos a guardar los precios de ${nombreProv} el ${diaCorto(serie[0].f)}.`, `We started recording prices for ${nombreProv} on ${diaCorto(serie[0].f)}.`);
    $('tendencia-detalle').textContent = tr('En unos días verás aquí si hoy está más caro o más barato que la semana pasada.', "In a few days you'll see here whether today is cheaper or dearer than last week.");
    $('tendencia-caja').hidden = true;
    bloque.hidden = false;
    return;
  }
  const igual = Math.abs(t.diferencia) < 0.005;
  $('tendencia-frase').textContent = igual
    ? tr(`En ${nombreProv}, ${combustibleTxt} está en la media de la última semana.`, `In ${nombreProv}, ${combustibleTxt} is at last week's average.`)
    : t.diferencia < 0
      ? tr(`Buen momento: en ${nombreProv}, ${combustibleTxt} está ${centimos(t.diferencia)} céntimos por debajo de la media de la semana.`, `Good time to fill up: in ${nombreProv}, ${combustibleTxt} is ${centimos(t.diferencia)} cents below the weekly average.`)
      : tr(`Si puedes, espera: en ${nombreProv}, ${combustibleTxt} está ${centimos(t.diferencia)} céntimos por encima de la media de la semana.`, `Wait if you can: in ${nombreProv}, ${combustibleTxt} is ${centimos(t.diferencia)} cents above the weekly average.`);
  $('tendencia-detalle').textContent =
    tr(`Media de hoy: ${euros(t.hoy)} €/l. Media de los días anteriores: ${euros(t.media7)} €/l.`, `Today's average: ${euros(t.hoy)} €/l. Previous days' average: ${euros(t.media7)} €/l.`) +
    (t.hace7 !== null ? tr(` Hace una semana: ${euros(t.hace7)} €/l.`, ` A week ago: ${euros(t.hace7)} €/l.`) : '');
  pintarChispa(serie.slice(-30), c, nombreProv, combustibleTxt);
  bloque.hidden = false;
}

function pintarChispa(serie, c, nombreProv, combustibleTxt) {
  const svg = $('tendencia-grafico');
  const puntos = serie.filter((x) => typeof x[c] === 'number');
  if (puntos.length < 3) { $('tendencia-caja').hidden = true; return; }
  $('tendencia-caja').hidden = false;
  const W = Math.max(svg.clientWidth || 600, 280), H = 90, M = 8;
  const vs = puntos.map((x) => x[c]);
  const min = Math.min(...vs), max = Math.max(...vs) || min + 0.01;
  const x = (i) => M + (i / (puntos.length - 1)) * (W - 2 * M);
  const y = (v) => M + (max === min ? 0.5 : (max - v) / (max - min)) * (H - 2 * M);
  const linea = puntos.map((p, i) => `${x(i).toFixed(1)},${y(p[c]).toFixed(1)}`).join(' ');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `<polyline points="${linea}" class="linea"/><circle cx="${x(puntos.length - 1)}" cy="${y(vs.at(-1))}" r="4.5" class="punto"/>`;
  svg.setAttribute('aria-label', tr(`Precio medio de ${combustibleTxt} en ${nombreProv} los últimos ${puntos.length} días: entre ${euros(min)} y ${euros(max)} €/l; hoy ${euros(vs.at(-1))} €/l.`, `Average price of ${combustibleTxt} in ${nombreProv} over the last ${puntos.length} days: between ${euros(min)} and ${euros(max)} €/l; today ${euros(vs.at(-1))} €/l.`));
}

async function cargarProvincias(ids) {
  await Promise.all(
    ids.filter((id) => !cargadas.has(id)).map(async (id) => {
      try {
        cargadas.set(id, expandir(await json(`gasolina/${id}.json`)));
      } catch {
        cargadas.set(id, []);
      }
    })
  );
  estaciones = [...new Set(ids)].flatMap((id) => cargadas.get(id) ?? []);
}

async function fijarCentro(nuevo) {
  centro = nuevo;
  await cargarProvincias(provinciasCercanas(indice, centro, RADIO_MAXIMO));
  pintar();
}
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
  for (const clave of Object.keys(COMBUSTIBLES)) {
    select.add(new Option(nombreCombustible(clave), clave));
  }
  const c = leer('combustible');
  if (c && COMBUSTIBLES[c]) select.value = c;
  const r = leer('radio');
  const opcion = r && document.querySelector(`input[name=radio][value="${r}"]`);
  if (opcion) opcion.checked = true;
  const cp = leer('cp');
  if (cp) $('cp').value = cp;

  const soloAbiertas = $('abiertas');
  soloAbiertas.checked = leer('abiertas') !== 'no';
  soloAbiertas.addEventListener('change', () => { guardar('abiertas', soloAbiertas.checked ? 'si' : 'no'); pintar(); });

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
      attribution: tr('&copy; colaboradores de ', '&copy; ') + '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' + tr('', ' contributors'),
    }).addTo(mapa);
    capa = L.layerGroup().addTo(mapa);
  }
  capa.clearLayers();
  const c = combustible();
  L.circleMarker([centro.lat, centro.lon], { radius: 7, weight: 3, color: '#2b59c3', fillOpacity: 0.2 })
    .bindTooltip(tr('Tú', 'You')).addTo(capa);
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
  const momento = ahoraEnEspana();
  const conEstado = estaciones.map((e) => ({ ...e, abierta: abierta(e.horario, momento) }));
  const filtradas = $('abiertas').checked ? conEstado.filter((e) => e.abierta !== false) : conEstado;
  const todas = cercanas(filtradas, centro, r, c);
  const nombre = nombreCombustible(c);

  if (!todas.length) {
    const abiertas = $('abiertas').checked;
    $('titular').textContent = tr(
      `No hay gasolineras${abiertas ? ' abiertas ahora' : ''} con ${nombre.toLowerCase().replace('glp', 'GLP')} a menos de ${r} km.`,
      `No${abiertas ? ' open' : ''} petrol stations with ${nombre.toLowerCase().replace('lpg', 'LPG')} within ${r} km.`
    );
    $('entradilla').textContent = abiertas
      ? tr('Prueba a ampliar la distancia, a elegir otro combustible o a ver también las cerradas.', 'Try a wider distance, another fuel, or include closed stations.')
      : tr('Prueba a ampliar la distancia o a elegir otro combustible.', 'Try a wider distance or another fuel.');
    $('resumen').hidden = true;
    $('resultados').hidden = true;
    $('bloque-tendencia').hidden = true;
    return;
  }

  const lista = todas.slice(0, MAXIMO_LISTA);
  const precios = todas.map((e) => e[c]);
  const min = Math.min(...precios);
  const max = Math.max(...precios);
  const mejor = todas[0];

  $('titular').textContent = tr(
    `La más barata a menos de ${r} km: ${mejor.rotulo || 'una gasolinera sin marca'}, a ${euros(mejor[c])} €/l.`,
    `Cheapest within ${r} km: ${mejor.rotulo || 'an unbranded station'}, at ${euros(mejor[c])} €/l.`
  );
  $('entradilla').textContent = tr(
    `${nombre} cerca ${centro.etiqueta}. A ${km(mejor.km)}, en ${mejor.direccion}.`,
    `${nombre} near ${centro.etiquetaEn}. ${km(mejor.km)} away, at ${mejor.direccion}.`
  );

  const ahorro50 = (max - min) * 50;
  $('resumen').innerHTML = `
    <span><strong>${todas.length}</strong> ${tr('gasolineras', 'stations')}</span>
    <span>${tr('Entre', 'Between')} <strong>${euros(min)}</strong> ${tr('y', 'and')} <strong>${euros(max)}</strong> €/l</span>
    ${ahorro50 >= 0.5 ? `<span>${tr('En un depósito de 50 l ahorras hasta', 'On a 50 l tank you save up to')} <strong>${eurosMoneda(ahorro50)}</strong></span>` : ''}`;
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
            <h3>${escapar(e.rotulo || tr('Gasolinera sin marca', 'Unbranded station'))}</h3>
            <p>${escapar(e.direccion)}, ${escapar(e.municipio)}</p>
            <p class="meta"><span>${tr(`A ${km(e.km)}`, `${km(e.km)} away`)}</span><span class="estado ${e.abierta === true ? 'abierta' : e.abierta === false ? 'cerrada' : ''}">${e.abierta === true ? tr('Abierta', 'Open') : e.abierta === false ? tr('Cerrada', 'Closed') : tr('Horario', 'Hours')}</span><span>${escapar(horarioTexto(e.horario))}</span></p>
          </div>
          <a class="llegar" href="${destino}" target="_blank" rel="noopener">${tr('Cómo llegar', 'Directions')}</a>
        </li>`;
    })
    .join('');

  pintarMapa(lista, min, max);

  // Provincia de referencia para la tendencia: la de la gasolinera más barata
  if (mejor.prov) pintarTendencia(mejor.prov, c);
}

function usarUbicacion() {
  if (!navigator.geolocation) {
    avisar(tr('Tu navegador no permite compartir la ubicación. Busca por código postal.', "Your browser can't share your location. Search by postcode instead."));
    return;
  }
  avisar(tr('Buscando tu ubicación…', 'Finding your location…'));
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      avisar('');
      fijarCentro({ lat: pos.coords.latitude, lon: pos.coords.longitude, etiqueta: 'de ti', etiquetaEn: 'you' });
    },
    () => avisar(tr('No hemos podido obtener tu ubicación. Busca por código postal.', "We couldn't get your location. Search by postcode instead.")),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

async function buscarCodigoPostal(ev) {
  ev.preventDefault();
  const cp = $('cp').value.trim();
  if (!/^\d{5}$/.test(cp)) {
    avisar(tr('Escribe un código postal de 5 cifras, por ejemplo 28100.', 'Enter a 5-digit Spanish postcode, for example 28100.'));
    return;
  }
  const prov = cp.slice(0, 2);
  let lugar = null;
  try {
    const cps = await json(`cp/${prov}.json`);
    if (cps[cp]) lugar = { lat: cps[cp][0], lon: cps[cp][1], municipio: cps[cp][2] };
  } catch {}
  if (!lugar) {
    // Sin listado de códigos postales: usamos las gasolineras de ese código como referencia.
    await cargarProvincias([prov]);
    lugar = centroCodigoPostal(estaciones, cp);
  }
  if (!lugar) {
    avisar(tr(`No encontramos el ${cp}. Comprueba que está bien escrito o usa tu ubicación.`, `We couldn't find ${cp}. Check it's correct or use your location.`));
    return;
  }
  avisar('');
  guardar('cp', cp);
  fijarCentro({ lat: lugar.lat, lon: lugar.lon, etiqueta: `del ${cp} (${lugar.municipio})`, etiquetaEn: `${cp} (${lugar.municipio})` });
}

async function iniciar() {
  prepararFiltros();
  $('ubicacion').addEventListener('click', usarUbicacion);
  $('buscador').addEventListener('submit', buscarCodigoPostal);

  try {
    indice = await json('gasolina/indice.json');
    if (indice.fecha) {
      const fecha = new Date(indice.fecha);
      const f = formato({ dateStyle: 'long', timeStyle: 'short' });
      $('actualizado').textContent = tr(`Precios del ${f.format(fecha)}.`, `Prices as of ${f.format(fecha)}.`);
      const horas = (Date.now() - fecha.getTime()) / 3600000;
      if (horas > HORAS_ANTIGUEDAD) {
        $('antiguedad').textContent = tr(`Estos precios son del ${f.format(fecha)} y pueden haber cambiado. Estamos teniendo problemas para actualizarlos.`, `These prices are from ${f.format(fecha)} and may have changed. We're having trouble updating them.`);
        $('antiguedad').hidden = false;
      }
    }
  } catch {
    avisar(tr('Los precios de carburantes no están disponibles ahora mismo. Vuelve a intentarlo en un rato.', "Fuel prices aren't available right now. Please try again shortly."));
    document.querySelectorAll('#buscador button, #buscador input').forEach((el) => (el.disabled = true));
  }
}

iniciar();
