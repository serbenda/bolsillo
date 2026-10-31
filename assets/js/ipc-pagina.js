import { equivalencia, interanual, poderAdquisitivo } from './ipc.js';
import { tr, euros, porcentaje, formato, numero } from './idioma.js';

const $ = (id) => document.getElementById(id);
const FICHERO = new URL('../../data/ipc.json', import.meta.url);

const pct = (x, dec = 1) => porcentaje(x * 100, dec);
const FORMATO_MES = formato({ month: 'long', year: 'numeric', timeZone: 'UTC' });
const nombreMes = (mes) => FORMATO_MES.format(new Date(`${mes}-01T00:00:00Z`));
// "1.250,5" o "1,250.5" → 1250.5 (vale en los dos idiomas)
const decimal = (s) => {
  const t = String(s).replace(/\s/g, '');
  const ultimo = Math.max(t.lastIndexOf(','), t.lastIndexOf('.'));
  if (ultimo < 0) return Number(t);
  const dec = t.slice(ultimo + 1);
  // Un punto o coma seguido de 3 cifras exactas es separador de miles («1.000», «1,000»)
  if (dec.length === 3 && !/[.,]/.test(t.slice(0, ultimo))) return Number(t.replace(/[.,]/g, ''));
  return Number(`${t.slice(0, ultimo).replace(/[.,]/g, '')}.${dec}`);
};

const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.ipc.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.ipc.${k}`); } catch { return null; } };

let serie = [];
let tasas = [];

function avisar(texto) {
  $('mensaje').textContent = texto ?? '';
  $('mensaje').hidden = !texto;
}

function calcular() {
  const cantidad = decimal($('cantidad').value);
  const desde = $('desde').value;
  const hasta = $('hasta').value;
  const e = equivalencia(serie, cantidad, desde, hasta);
  if (!e || !(cantidad > 0)) {
    $('resultado').textContent = tr('Escribe una cantidad mayor que cero, por ejemplo 100.', 'Enter an amount above zero, for example 100.');
    $('resultado-detalle').textContent = '';
    return;
  }
  for (const id of ['cantidad', 'desde', 'hasta']) guardar(id, $(id).value);
  const sube = e.subida >= 0;
  $('resultado').textContent = tr(
    `${euros(cantidad)} de ${nombreMes(desde)} equivalen a ${euros(e.cantidad)} de ${nombreMes(hasta)}.`,
    `${euros(cantidad)} in ${nombreMes(desde)} is worth ${euros(e.cantidad)} in ${nombreMes(hasta)}.`
  );
  const inversa = equivalencia(serie, cantidad, hasta, desde);
  $('resultado-detalle').textContent = sube
    ? tr(
        `Los precios han subido un ${pct(e.subida)}. Dicho al revés: con ${euros(cantidad)} de ${nombreMes(hasta)} compras lo que con ${euros(inversa.cantidad)} de ${nombreMes(desde)}.`,
        `Prices have risen ${pct(e.subida)}. Put the other way: ${euros(cantidad)} in ${nombreMes(hasta)} buys what ${euros(inversa.cantidad)} did in ${nombreMes(desde)}.`
      )
    : tr(`Los precios han bajado un ${pct(-e.subida)} entre esas fechas.`, `Prices fell ${pct(-e.subida)} between those dates.`);
  pintarHistoria(desde, hasta);
}

function pintarHistoria(desde, hasta) {
  $('bloque-historia').hidden = false;
  const svg = $('historia');
  const W = Math.max(svg.clientWidth, 300);
  const H = Math.max(svg.clientHeight, 180);
  const M = { t: 16, r: 12, b: 28, l: 36 };
  const vs = tasas.map((t) => t.tasa * 100);
  const min = Math.min(-2, Math.floor(Math.min(...vs)));
  const max = Math.max(4, Math.ceil(Math.max(...vs)));
  const x = (i) => M.l + (i / (tasas.length - 1)) * (W - M.l - M.r);
  const y = (v) => M.t + ((max - v) / (max - min)) * (H - M.t - M.b);
  const paso = max - min > 10 ? 2 : 1;

  let g = '';
  // Tramo elegido en la calculadora, sombreado
  const i0 = tasas.findIndex((t) => t.mes >= desde);
  const i1 = tasas.findLastIndex((t) => t.mes <= hasta);
  if (i0 >= 0 && i1 > i0) g += `<rect x="${x(i0)}" y="${M.t}" width="${x(i1) - x(i0)}" height="${H - M.t - M.b}" class="tramo"/>`;
  for (let v = Math.ceil(min / paso) * paso; v <= max; v += paso) {
    g += `<line x1="${M.l}" x2="${W - M.r}" y1="${y(v)}" y2="${y(v)}" class="${v === 0 ? 'cero' : 'rejilla'}"/>`;
    g += `<text x="${M.l - 8}" y="${y(v) + 4}" class="eje" text-anchor="end">${v}</text>`;
  }
  const cada = W < 600 ? 6 : 3;
  tasas.forEach((t, i) => {
    if (t.mes.endsWith('-01') && Number(t.mes.slice(0, 4)) % cada === 0) {
      g += `<text x="${x(i)}" y="${H - 6}" class="eje" text-anchor="middle">${t.mes.slice(0, 4)}</text>`;
    }
  });
  g += `<polyline points="${tasas.map((t, i) => `${x(i).toFixed(1)},${y(t.tasa * 100).toFixed(1)}`).join(' ')}" class="linea"/>`;
  g += `<circle cx="${x(tasas.length - 1)}" cy="${y(vs.at(-1))}" r="6" class="punto-ahora"/>`;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = g;

  const maxima = tasas.reduce((a, b) => (b.tasa > a.tasa ? b : a));
  const minima = tasas.reduce((a, b) => (b.tasa < a.tasa ? b : a));
  const resumen = tr(
    `Máxima ${pct(maxima.tasa)} en ${nombreMes(maxima.mes)}; mínima ${pct(minima.tasa)} en ${nombreMes(minima.mes)}.`,
    `Highest ${pct(maxima.tasa)} in ${nombreMes(maxima.mes)}; lowest ${pct(minima.tasa)} in ${nombreMes(minima.mes)}.`
  );
  svg.setAttribute('aria-label', tr(`Inflación interanual en España desde ${nombreMes(tasas[0].mes)}, en porcentaje. ${resumen}`, `Annual inflation in Spain since ${nombreMes(tasas[0].mes)}, in percent. ${resumen}`));
  $('pie-historia').textContent = tr(
    `Porcentaje de subida de los precios frente al mismo mes del año anterior. La zona sombreada es el periodo de tu cálculo. ${resumen}`,
    `Price rise compared with the same month a year earlier. The shaded area is the period of your calculation. ${resumen}`
  );
}

function calcularSueldo() {
  const anyo = Number($('anyo-sueldo').value);
  const antes = decimal($('sueldo-antes').value);
  const hoy = decimal($('sueldo-hoy').value);
  const r = poderAdquisitivo(serie, anyo, antes, hoy);
  if (!r) {
    $('resultado-sueldo').textContent = tr('Escribe dos sueldos mayores que cero.', 'Enter two salaries above zero.');
    $('detalle-sueldo').textContent = '';
    return;
  }
  for (const id of ['sueldo-antes', 'sueldo-hoy', 'anyo-sueldo']) guardar(id, $(id).value);
  const real = pct(Math.abs(r.real));
  $('resultado-sueldo').textContent = Math.abs(r.real) < 0.005
    ? tr(`Tu sueldo ha subido lo mismo que los precios desde ${anyo}.`, `Your salary has kept pace with prices since ${anyo}.`)
    : r.real > 0
      ? tr(`Has ganado poder de compra: hoy puedes comprar un ${real} más que en ${anyo}.`, `You've gained buying power: you can buy ${real} more than in ${anyo}.`)
      : tr(`Has perdido poder de compra: hoy puedes comprar un ${real} menos que en ${anyo}.`, `You've lost buying power: you can buy ${real} less than in ${anyo}.`);
  const dif = euros(Math.abs(r.diferencia), 0);
  $('detalle-sueldo').textContent = tr(
    `Los precios han subido un ${pct(r.inflacion)} desde ${anyo}. Para comprar lo mismo que entonces necesitarías cobrar ${euros(r.necesario, 0)} al mes; cobras ${euros(hoy, 0)}${Math.abs(r.real) < 0.005 ? '.' : `, ${dif} ${r.diferencia > 0 ? 'más' : 'menos'} al mes.`}`,
    `Prices have risen ${pct(r.inflacion)} since ${anyo}. To buy the same as then you'd need ${euros(r.necesario, 0)} a month; you earn ${euros(hoy, 0)}${Math.abs(r.real) < 0.005 ? '.' : `, ${dif} ${r.diferencia > 0 ? 'more' : 'less'} a month.`}`
  );
}

async function iniciar() {
  try {
    const r = await fetch(FICHERO); // precargado desde el HTML
    if (!r.ok) throw new Error(r.status);
    ({ serie } = await r.json());
    if (!serie?.length) throw new Error('vacío');
  } catch {
    $('titular').textContent = tr('¿Cuánto ha subido la vida?', 'How much have prices gone up?');
    avisar(tr('Los datos del IPC no están disponibles ahora mismo. Vuelve a intentarlo en un rato.', "Inflation data isn't available right now. Please try again shortly."));
    document.querySelectorAll('form input, form select').forEach((el) => (el.disabled = true));
    return;
  }
  tasas = interanual(serie);
  const ultimo = serie.at(-1);
  const tasa = tasas.at(-1);
  $('titular').textContent = tasa.tasa >= 0
    ? tr(`La vida cuesta hoy un ${pct(tasa.tasa)} más que hace un año.`, `Living costs ${pct(tasa.tasa)} more today than a year ago.`)
    : tr(`Los precios están un ${pct(-tasa.tasa)} más bajos que hace un año.`, `Prices are ${pct(-tasa.tasa)} lower than a year ago.`);
  $('entradilla').textContent = tr(
    `Dato de ${nombreMes(ultimo.mes)}, el último publicado por el INE. Calcula cuánto valen hoy tus euros de otra fecha.`,
    `${nombreMes(ultimo.mes)} figure, the latest published by INE. Work out what your euros from another date are worth today.`
  );

  const opciones = [...serie].reverse().map((p) => new Option(nombreMes(p.mes), p.mes));
  for (const o of opciones) { $('desde').add(o.cloneNode(true)); $('hasta').add(o); }
  // Por defecto: de hace 10 años a hoy
  const hace10 = `${Number(ultimo.mes.slice(0, 4)) - 10}${ultimo.mes.slice(4)}`;
  $('desde').value = serie.some((p) => p.mes === hace10) ? hace10 : serie[0].mes;
  $('hasta').value = ultimo.mes;
  for (const id of ['cantidad', 'desde', 'hasta']) {
    const v = leer(id);
    if (v !== null && (id === 'cantidad' || serie.some((p) => p.mes === v))) $(id).value = v;
    $(id).addEventListener('input', calcular);
  }
  $('formulario').addEventListener('submit', (e) => e.preventDefault());
  $('actualizado').textContent = tr(`Último dato: ${nombreMes(ultimo.mes)}.`, `Latest figure: ${nombreMes(ultimo.mes)}.`);
  calcular();

  // Sueldo: solo años completos, sin contar el último (se compara con los últimos 12 meses)
  const anos = [...new Set(serie.map((p) => p.mes.slice(0, 4)))]
    .filter((a) => serie.filter((p) => p.mes.startsWith(`${a}-`)).length === 12 && Number(a) < Number(ultimo.mes.slice(0, 4)))
    .reverse();
  for (const a of anos) $('anyo-sueldo').add(new Option(a, a));
  $('anyo-sueldo').value = anos.find((a) => Number(a) === Number(ultimo.mes.slice(0, 4)) - 5) ?? anos[0];
  $('sueldo-antes').value = numero(1500, 0);
  $('sueldo-hoy').value = numero(1650, 0);
  for (const id of ['sueldo-antes', 'sueldo-hoy', 'anyo-sueldo']) {
    const v = leer(id);
    if (v !== null && (id !== 'anyo-sueldo' || anos.includes(v))) $(id).value = v;
    $(id).addEventListener('input', calcularSueldo);
  }
  $('form-sueldo').addEventListener('submit', (e) => e.preventDefault());
  calcularSueldo();

  let espera;
  new ResizeObserver(() => {
    clearTimeout(espera);
    espera = setTimeout(() => pintarHistoria($('desde').value, $('hasta').value), 100);
  }).observe($('historia'));
}

iniciar();
