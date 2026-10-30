import { cargarLuz, formatoPrecio, horaTexto } from './datos-luz.js';
import { horaMadrid } from './ree.js';
import { mejorTramo, clasificar, media } from './ventana.js';
import { factorImpuestos, impuestosEn, APARATOS } from './impuestos.js';

const $ = (id) => document.getElementById(id);
const ETIQUETA = { barata: 'más barata', media: 'intermedia', cara: 'más cara' };
const euros = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const porcentaje = (n) => `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(n * 100)} %`;

const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.luz.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.luz.${k}`); } catch { return null; } };

const datos = await cargarLuz();
const horaActual = horaMadrid();
let diaVisible = 'hoy';
let tramoElegido = null;
let conImpuestos = leer('impuestos') !== 'no';

const cuando = (fecha) => (fecha === datos.fechaHoy ? 'hoy' : 'mañana');
/** Precio a mostrar (€/kWh), con o sin impuestos según el interruptor. */
const precio = (h) => h.precio * (conImpuestos ? factorImpuestos(h.fecha) : 1);
const verPrecio = (h) => formatoPrecio(precio(h));

function candidatas() {
  return [...datos.hoy.filter((h) => h.hora >= horaActual), ...(datos.manana ?? [])];
}

function pintarCabecera() {
  const actual = datos.hoy.find((h) => h.hora === horaActual);
  const clases = clasificar(datos.hoy);
  const claseActual = clases[datos.hoy.indexOf(actual)];
  const mejor = mejorTramo(candidatas(), 1);

  const titular = $('titular');
  if (mejor && mejor.inicio.fecha === datos.fechaHoy && mejor.inicio.hora === horaActual) {
    titular.textContent = 'Ahora mismo es la hora más barata que queda.';
  } else if (mejor) {
    titular.textContent = `La luz más barata llega ${cuando(mejor.inicio.fecha)} a las ${horaTexto(mejor.inicio.hora)}.`;
  }

  const precios = datos.hoy.map(precio);
  const mediaHoy = media(datos.hoy) * (conImpuestos ? factorImpuestos(datos.fechaHoy) : 1);
  $('ahora').innerHTML = `
    <span>Ahora <strong>${actual ? verPrecio(actual) : '—'} €/kWh</strong>
      ${actual ? `<span class="chapa ${claseActual}">${ETIQUETA[claseActual]}</span>` : ''}</span>
    <span>Media de hoy <strong>${formatoPrecio(mediaHoy)}</strong></span>
    <span>Entre <strong>${formatoPrecio(Math.min(...precios))}</strong> y <strong>${formatoPrecio(Math.max(...precios))}</strong></span>`;
  $('ahora').hidden = false;
}

function pintarGrafico() {
  const horas = diaVisible === 'hoy' ? datos.hoy : datos.manana;
  const grafico = $('grafico');
  const tabla = $('tabla');
  grafico.classList.remove('listo');
  grafico.innerHTML = '';
  tabla.innerHTML = '';
  if (!horas) return;

  const clases = clasificar(horas);
  const max = Math.max(...horas.map((h) => h.precio));
  const elegidas = new Set(tramoElegido?.horas.map((h) => `${h.fecha}-${h.hora}`));
  grafico.style.setProperty('--n', horas.length);

  horas.forEach((h, i) => {
    const barra = document.createElement('div');
    barra.className = `barra ${clases[i]}`;
    if (h.fecha === datos.fechaHoy && h.hora < horaActual) barra.classList.add('pasada');
    if (h.fecha === datos.fechaHoy && h.hora === horaActual) barra.classList.add('actual');
    if (elegidas.has(`${h.fecha}-${h.hora}`)) barra.classList.add('elegida');
    barra.style.setProperty('--alto', `${(h.precio / max) * 100}%`);
    barra.style.setProperty('--i', i);
    barra.title = `${horaTexto(h.hora)}: ${verPrecio(h)} €/kWh`;
    barra.innerHTML = `<span>${h.hora}</span>`;
    grafico.append(barra);

    const fila = document.createElement('tr');
    fila.innerHTML = `<td>${horaTexto(h.hora)}</td><td>${verPrecio(h)}</td>`;
    tabla.append(fila);
  });

  const minimo = horas.reduce((a, b) => (b.precio < a.precio ? b : a));
  const maximo = horas.reduce((a, b) => (b.precio > a.precio ? b : a));
  grafico.setAttribute(
    'aria-label',
    `Precio de la luz ${cuando(horas[0].fecha)} por horas. Mínimo ${verPrecio(minimo)} €/kWh a las ${horaTexto(minimo.hora)}, máximo ${verPrecio(maximo)} €/kWh a las ${horaTexto(maximo.hora)}.`
  );
  requestAnimationFrame(() => grafico.classList.add('listo'));
}

/** Coste en € de un aparato si empieza ahora y en su mejor tramo. */
function costes(aparato) {
  const lista = candidatas();
  const mejor = mejorTramo(lista, aparato.horas);
  const desdeAhora = mejorTramo(lista.slice(0, aparato.horas), aparato.horas);
  const coste = (tramo) => tramo && aparato.kwh * media(tramo.horas.map((h) => ({ precio: precio(h) })));
  return { mejor, ahora: coste(desdeAhora), enMejor: coste(mejor) };
}

function aparatoElegido() {
  const id = document.querySelector('input[name=aparato]:checked')?.value;
  return APARATOS.find((a) => a.id === id) ?? APARATOS[0];
}

function pintarPlan() {
  const aparato = aparatoElegido();
  const { mejor, ahora, enMejor } = costes(aparato);
  tramoElegido = mejor;
  const resultado = $('resultado');
  const ahorro = $('ahorro');
  $('t-plan').textContent = aparato.pregunta;

  if (!mejor) {
    resultado.textContent = 'No quedan horas suficientes con precio publicado. Vuelve después de las 20:15 para ver las de mañana.';
    ahorro.textContent = '';
    pintarGrafico();
    return;
  }

  const { inicio } = mejor;
  const fin = (inicio.hora + aparato.horas) % 24;
  const yaEs = inicio.fecha === datos.fechaHoy && inicio.hora === horaActual;
  resultado.textContent = yaEs
    ? `Ahora mismo: de ${horaTexto(inicio.hora)} a ${horaTexto(fin)} es lo más barato.`
    : `${cuando(inicio.fecha) === 'hoy' ? 'Hoy' : 'Mañana'} a las ${horaTexto(inicio.hora)}, hasta las ${horaTexto(fin)}.`;

  const impuestos = conImpuestos ? 'con impuestos' : 'sin impuestos';
  if (!yaEs && ahora && ahora - enMejor >= 0.005) {
    ahorro.textContent = `${aparato.nombre} (${aparato.detalle}): ${euros(enMejor)} en vez de ${euros(ahora)} si ${aparato.lo} pones ahora, ${impuestos}.`;
  } else {
    ahorro.textContent = `${aparato.nombre} (${aparato.detalle}): ${euros(enMejor)}, ${impuestos}.`;
  }

  cambiarDia(inicio.fecha === datos.fechaHoy ? 'hoy' : 'manana');
}

function pintarCostes() {
  $('costes').innerHTML = APARATOS.map((a) => {
    const { mejor, ahora, enMejor } = costes(a);
    const momento = mejor ? `${cuando(mejor.inicio.fecha)} a las ${horaTexto(mejor.inicio.hora)}` : '—';
    return `<tr>
      <th scope="row">${a.nombre}<small>${a.detalle}</small></th>
      <td>${ahora ? euros(ahora) : '—'}</td>
      <td>${enMejor ? euros(enMejor) : '—'}<small>${momento}</small></td>
    </tr>`;
  }).join('');
  $('bloque-costes').hidden = false;
}

function cambiarDia(dia) {
  diaVisible = dia;
  document.querySelectorAll('.pestanas button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.dia === dia));
  });
  pintarGrafico();
}

function pintarTodo() {
  pintarCabecera();
  pintarPlan();
  pintarCostes();
}

function prepararAparatos() {
  const elegido = leer('aparato') ?? 'lavadora';
  $('aparatos').insertAdjacentHTML(
    'beforeend',
    APARATOS.map(
      (a) => `<label><input type="radio" name="aparato" value="${a.id}"${a.id === elegido ? ' checked' : ''}> ${a.nombre}</label>`
    ).join('')
  );
  if (!document.querySelector('input[name=aparato]:checked')) document.querySelector('input[name=aparato]').checked = true;
  document.querySelectorAll('input[name=aparato]').forEach((r) =>
    r.addEventListener('change', () => { guardar('aparato', r.value); pintarPlan(); })
  );
}

if (!datos.hoy) {
  $('titular').textContent = 'El precio de la luz no está disponible ahora mismo.';
  $('error').hidden = false;
} else {
  const { iee, iva } = impuestosEn(datos.fechaHoy);
  $('iee').textContent = porcentaje(iee);
  $('iva').textContent = porcentaje(iva);

  const casilla = $('con-impuestos');
  casilla.checked = conImpuestos;
  casilla.addEventListener('change', () => {
    conImpuestos = casilla.checked;
    guardar('impuestos', conImpuestos ? 'si' : 'no');
    pintarTodo();
  });
  $('interruptor').hidden = false;

  $('bloque-grafico').hidden = false;
  $('bloque-plan').hidden = false;
  if (!datos.manana) {
    document.querySelector('[data-dia="manana"]').disabled = true;
    $('nota-manana').hidden = false;
  }
  document.querySelectorAll('.pestanas button').forEach((b) =>
    b.addEventListener('click', () => cambiarDia(b.dataset.dia))
  );
  prepararAparatos();
  pintarTodo();

  if (datos.actualizado) {
    const f = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Madrid' });
    $('actualizado').textContent = `Datos actualizados el ${f.format(datos.actualizado)}.`;
  }
}
