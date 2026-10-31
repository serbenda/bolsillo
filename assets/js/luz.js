import { cargarLuz, formatoPrecio, horaTexto } from './datos-luz.js';
import { horaMadrid } from './ree.js';
import { mejorTramo, clasificar, media } from './ventana.js';
import { factorImpuestos, impuestosEn, APARATOS } from './impuestos.js';
import { tr, idioma, euros, porcentaje, formato } from './idioma.js';

const $ = (id) => document.getElementById(id);
const ETIQUETA = {
  barata: tr('más barata', 'cheapest'),
  media: tr('intermedia', 'mid-range'),
  cara: tr('más cara', 'most expensive'),
};

// Textos de cada aparato en inglés (los de castellano están en impuestos.js)
const APARATOS_EN = {
  lavadora: { nombre: 'Washing machine', detalle: 'one wash at 40 °C', pregunta: 'When should I run the washing machine?' },
  lavavajillas: { nombre: 'Dishwasher', detalle: 'one normal cycle', pregunta: 'When should I run the dishwasher?' },
  secadora: { nombre: 'Tumble dryer', detalle: 'one load', pregunta: 'When should I run the dryer?' },
  horno: { nombre: 'Oven', detalle: 'one hour at 200 °C', pregunta: 'When should I use the oven?' },
  coche: { nombre: 'Electric car', detalle: 'charge for 100 km', pregunta: 'When should I charge the car?' },
};
const textos = (a) => (idioma === 'en' ? { ...a, ...APARATOS_EN[a.id] } : a);

const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.luz.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.luz.${k}`); } catch { return null; } };

const datos = await cargarLuz();
const horaActual = horaMadrid();
let diaVisible = 'hoy';
let tramoElegido = null;
let conImpuestos = leer('impuestos') !== 'no';

const esHoy = (fecha) => fecha === datos.fechaHoy;
const cuando = (fecha) => (esHoy(fecha) ? tr('hoy', 'today') : tr('mañana', 'tomorrow'));
/** «a las 14:00» / «at 14:00» */
const aLas = (h) => tr(`a las ${horaTexto(h)}`, `at ${horaTexto(h)}`);
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
  if (mejor && esHoy(mejor.inicio.fecha) && mejor.inicio.hora === horaActual) {
    titular.textContent = tr('Ahora mismo es la hora más barata que queda.', 'Right now is the cheapest hour left.');
  } else if (mejor) {
    titular.textContent = tr(
      `La luz más barata llega ${cuando(mejor.inicio.fecha)} ${aLas(mejor.inicio.hora)}.`,
      `The cheapest electricity comes ${cuando(mejor.inicio.fecha)} ${aLas(mejor.inicio.hora)}.`
    );
  }

  const precios = datos.hoy.map(precio);
  const mediaHoy = media(datos.hoy) * (conImpuestos ? factorImpuestos(datos.fechaHoy) : 1);
  $('ahora').innerHTML = `
    <span>${tr('Ahora', 'Now')} <strong>${actual ? verPrecio(actual) : '—'} €/kWh</strong>
      ${actual ? `<span class="chapa ${claseActual}">${ETIQUETA[claseActual]}</span>` : ''}</span>
    <span>${tr('Media de hoy', "Today's average")} <strong>${formatoPrecio(mediaHoy)}</strong></span>
    <span>${tr('Entre', 'Between')} <strong>${formatoPrecio(Math.min(...precios))}</strong> ${tr('y', 'and')} <strong>${formatoPrecio(Math.max(...precios))}</strong></span>`;
  $('ahora').classList.remove('reservado');
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
    if (esHoy(h.fecha) && h.hora < horaActual) barra.classList.add('pasada');
    if (esHoy(h.fecha) && h.hora === horaActual) barra.classList.add('actual');
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
    tr(
      `Precio de la luz ${cuando(horas[0].fecha)} por horas. Mínimo ${verPrecio(minimo)} €/kWh ${aLas(minimo.hora)}, máximo ${verPrecio(maximo)} €/kWh ${aLas(maximo.hora)}.`,
      `Hourly electricity price ${cuando(horas[0].fecha)}. Lowest ${verPrecio(minimo)} €/kWh ${aLas(minimo.hora)}, highest ${verPrecio(maximo)} €/kWh ${aLas(maximo.hora)}.`
    )
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
  return textos(APARATOS.find((a) => a.id === id) ?? APARATOS[0]);
}

function pintarPlan() {
  const aparato = aparatoElegido();
  const { mejor, ahora, enMejor } = costes(aparato);
  tramoElegido = mejor;
  const resultado = $('resultado');
  const ahorro = $('ahorro');
  $('t-plan').textContent = aparato.pregunta;

  if (!mejor) {
    resultado.textContent = tr(
      'No quedan horas suficientes con precio publicado. Vuelve después de las 20:15 para ver las de mañana.',
      "There aren't enough hours left with a published price. Come back after 20:15 for tomorrow's prices."
    );
    ahorro.textContent = '';
    pintarGrafico();
    return;
  }

  const { inicio } = mejor;
  const fin = (inicio.hora + aparato.horas) % 24;
  const yaEs = esHoy(inicio.fecha) && inicio.hora === horaActual;
  resultado.textContent = yaEs
    ? tr(`Ahora mismo: de ${horaTexto(inicio.hora)} a ${horaTexto(fin)} es lo más barato.`, `Right now: ${horaTexto(inicio.hora)} to ${horaTexto(fin)} is the cheapest slot.`)
    : tr(
        `${esHoy(inicio.fecha) ? 'Hoy' : 'Mañana'} ${aLas(inicio.hora)}, hasta las ${horaTexto(fin)}.`,
        `${esHoy(inicio.fecha) ? 'Today' : 'Tomorrow'} ${aLas(inicio.hora)}, until ${horaTexto(fin)}.`
      );

  const impuestos = conImpuestos ? tr('con impuestos', 'including taxes') : tr('sin impuestos', 'before taxes');
  if (!yaEs && ahora && ahora - enMejor >= 0.005) {
    ahorro.textContent = tr(
      `${aparato.nombre} (${aparato.detalle}): ${euros(enMejor)} en vez de ${euros(ahora)} si ${aparato.lo} pones ahora, ${impuestos}.`,
      `${aparato.nombre} (${aparato.detalle}): ${euros(enMejor)} instead of ${euros(ahora)} if you start now, ${impuestos}.`
    );
  } else {
    ahorro.textContent = `${aparato.nombre} (${aparato.detalle}): ${euros(enMejor)}, ${impuestos}.`;
  }

  cambiarDia(esHoy(inicio.fecha) ? 'hoy' : 'manana');
}

function pintarCostes() {
  $('costes').innerHTML = APARATOS.map(textos).map((a) => {
    const { mejor, ahora, enMejor } = costes(a);
    const momento = mejor ? `${cuando(mejor.inicio.fecha)} ${aLas(mejor.inicio.hora)}` : '—';
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
    APARATOS.map(textos).map(
      (a) => `<label><input type="radio" name="aparato" value="${a.id}"${a.id === elegido ? ' checked' : ''}> ${a.nombre}</label>`
    ).join('')
  );
  if (!document.querySelector('input[name=aparato]:checked')) document.querySelector('input[name=aparato]').checked = true;
  document.querySelectorAll('input[name=aparato]').forEach((r) =>
    r.addEventListener('change', () => { guardar('aparato', r.value); pintarPlan(); })
  );
}

if (!datos.hoy) {
  $('titular').textContent = tr('El precio de la luz no está disponible ahora mismo.', "The electricity price isn't available right now.");
  $('ahora').hidden = true;
  $('interruptor').hidden = true;
  $('error').hidden = false;
} else {
  const { iee, iva } = impuestosEn(datos.fechaHoy);
  $('iee').textContent = porcentaje(iee * 100, 2, 0);
  $('iva').textContent = porcentaje(iva * 100, 2, 0);

  const casilla = $('con-impuestos');
  casilla.checked = conImpuestos;
  casilla.addEventListener('change', () => {
    conImpuestos = casilla.checked;
    guardar('impuestos', conImpuestos ? 'si' : 'no');
    pintarTodo();
  });
  $('interruptor').classList.remove('reservado');

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
    const f = formato({ dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Madrid' });
    $('actualizado').textContent = tr(`Datos actualizados el ${f.format(datos.actualizado)}.`, `Data updated on ${f.format(datos.actualizado)}.`);
  }
}
