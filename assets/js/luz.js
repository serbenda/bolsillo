import { cargarLuz, formatoPrecio, horaTexto } from './datos-luz.js';
import { horaMadrid } from './ree.js';
import { mejorTramo, clasificar, media } from './ventana.js';

const $ = (id) => document.getElementById(id);
const ETIQUETA = { barata: 'más barata', media: 'intermedia', cara: 'más cara' };

const datos = await cargarLuz();
const horaActual = horaMadrid();
let diaVisible = 'hoy';
let tramoElegido = null;

const cuando = (fecha) => (fecha === datos.fechaHoy ? 'hoy' : 'mañana');

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

  const precios = datos.hoy.map((h) => h.precio);
  const ahora = $('ahora');
  ahora.innerHTML = `
    <span>Ahora <strong>${actual ? formatoPrecio(actual.precio) : '—'} €/kWh</strong>
      ${actual ? `<span class="chapa ${claseActual}">${ETIQUETA[claseActual]}</span>` : ''}</span>
    <span>Media de hoy <strong>${formatoPrecio(media(datos.hoy))}</strong></span>
    <span>Entre <strong>${formatoPrecio(Math.min(...precios))}</strong> y <strong>${formatoPrecio(Math.max(...precios))}</strong></span>`;
  ahora.hidden = false;
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
    barra.title = `${horaTexto(h.hora)}: ${formatoPrecio(h.precio)} €/kWh`;
    barra.innerHTML = `<span>${h.hora}</span>`;
    grafico.append(barra);

    const fila = document.createElement('tr');
    fila.innerHTML = `<td>${horaTexto(h.hora)}</td><td>${formatoPrecio(h.precio)}</td>`;
    tabla.append(fila);
  });

  const barata = horas[clases.indexOf('barata')] ?? horas[0];
  const minimo = horas.reduce((a, b) => (b.precio < a.precio ? b : a));
  const maximo = horas.reduce((a, b) => (b.precio > a.precio ? b : a));
  grafico.setAttribute(
    'aria-label',
    `Precio de la luz ${cuando(barata.fecha)} por horas. Mínimo ${formatoPrecio(minimo.precio)} €/kWh a las ${horaTexto(minimo.hora)}, máximo ${formatoPrecio(maximo.precio)} €/kWh a las ${horaTexto(maximo.hora)}.`
  );
  requestAnimationFrame(() => grafico.classList.add('listo'));
}

function pintarPlan() {
  const n = Number(document.querySelector('input[name=duracion]:checked').value);
  const lista = candidatas();
  tramoElegido = mejorTramo(lista, n);
  const resultado = $('resultado');
  const ahorro = $('ahorro');

  if (!tramoElegido) {
    resultado.textContent = 'No quedan horas suficientes con precio publicado. Vuelve después de las 20:15 para ver las de mañana.';
    ahorro.textContent = '';
    pintarGrafico();
    return;
  }

  const { inicio, media: m } = tramoElegido;
  const fin = (inicio.hora + n) % 24;
  const yaEs = inicio.fecha === datos.fechaHoy && inicio.hora === horaActual;
  resultado.textContent = yaEs
    ? `Ponla ya: de ${horaTexto(inicio.hora)} a ${horaTexto(fin)} es lo más barato.`
    : `Ponla ${cuando(inicio.fecha)} a las ${horaTexto(inicio.hora)} y acabará a las ${horaTexto(fin)}.`;

  const desdeAhora = lista.slice(0, n);
  if (!yaEs && desdeAhora.length === n) {
    const ref = media(desdeAhora);
    const pct = Math.round((1 - m / ref) * 100);
    ahorro.textContent = pct > 0
      ? `Media de ${formatoPrecio(m)} €/kWh, un ${pct} % menos que si la pones ahora.`
      : `Media de ${formatoPrecio(m)} €/kWh.`;
  } else {
    ahorro.textContent = `Media de ${formatoPrecio(m)} €/kWh.`;
  }

  // Si el tramo cae mañana y estamos viendo hoy (o al revés), mostramos ese día.
  const diaTramo = inicio.fecha === datos.fechaHoy ? 'hoy' : 'manana';
  cambiarDia(diaTramo);
}

function cambiarDia(dia) {
  diaVisible = dia;
  document.querySelectorAll('.pestanas button').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.dia === dia));
  });
  pintarGrafico();
}

if (!datos.hoy) {
  $('titular').textContent = 'El precio de la luz no está disponible ahora mismo.';
  $('error').hidden = false;
} else {
  pintarCabecera();
  $('bloque-grafico').hidden = false;
  $('bloque-plan').hidden = false;

  const botonManana = document.querySelector('[data-dia="manana"]');
  if (!datos.manana) {
    botonManana.disabled = true;
    $('nota-manana').hidden = false;
  }
  document.querySelectorAll('.pestanas button').forEach((b) =>
    b.addEventListener('click', () => cambiarDia(b.dataset.dia))
  );
  document.querySelectorAll('input[name=duracion]').forEach((r) => r.addEventListener('change', pintarPlan));
  pintarPlan();

  if (datos.actualizado) {
    const f = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Madrid' });
    $('actualizado').textContent = `Datos actualizados el ${f.format(datos.actualizado)}.`;
  }
}
