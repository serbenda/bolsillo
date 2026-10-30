import { equivalencia, interanual } from './ipc.js';

const $ = (id) => document.getElementById(id);
const FICHERO = new URL('../../data/ipc.json', import.meta.url);

const euros = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' }).format(n);
const pct = (x, dec = 1) => `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(x * 100)}\u00a0%`;
const nombreMes = (mes) =>
  new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${mes}-01T00:00:00Z`));
const decimal = (s) => Number(String(s).trim().replace(/\./g, '').replace(',', '.'));

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
    $('resultado').textContent = 'Escribe una cantidad mayor que cero, por ejemplo 100.';
    $('resultado-detalle').textContent = '';
    return;
  }
  for (const id of ['cantidad', 'desde', 'hasta']) guardar(id, $(id).value);
  const sube = e.subida >= 0;
  $('resultado').textContent = `${euros(cantidad)} de ${nombreMes(desde)} equivalen a ${euros(e.cantidad)} de ${nombreMes(hasta)}.`;
  const inversa = equivalencia(serie, cantidad, hasta, desde);
  $('resultado-detalle').textContent = sube
    ? `Los precios han subido un ${pct(e.subida)}. Dicho al revés: con ${euros(cantidad)} de ${nombreMes(hasta)} compras lo que con ${euros(inversa.cantidad)} de ${nombreMes(desde)}.`
    : `Los precios han bajado un ${pct(-e.subida)} entre esas fechas.`;
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
  const resumen = `Máxima ${pct(maxima.tasa)} en ${nombreMes(maxima.mes)}; mínima ${pct(minima.tasa)} en ${nombreMes(minima.mes)}.`;
  svg.setAttribute('aria-label', `Inflación interanual en España desde ${nombreMes(tasas[0].mes)}, en porcentaje. ${resumen}`);
  $('pie-historia').textContent = `Porcentaje de subida de los precios frente al mismo mes del año anterior. La zona sombreada es el periodo de tu cálculo. ${resumen}`;
}

async function iniciar() {
  try {
    const r = await fetch(FICHERO, { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    ({ serie } = await r.json());
    if (!serie?.length) throw new Error('vacío');
  } catch {
    avisar('Los datos del IPC no están disponibles ahora mismo. Vuelve a intentarlo en un rato.');
    $('formulario').querySelectorAll('input, select').forEach((el) => (el.disabled = true));
    return;
  }
  tasas = interanual(serie);
  const ultimo = serie.at(-1);
  const tasa = tasas.at(-1);
  $('titular').textContent = tasa.tasa >= 0
    ? `La vida cuesta hoy un ${pct(tasa.tasa)} más que hace un año.`
    : `Los precios están un ${pct(-tasa.tasa)} más bajos que hace un año.`;
  $('entradilla').textContent = `Dato de ${nombreMes(ultimo.mes)}, el último publicado por el INE. Calcula cuánto valen hoy tus euros de otra fecha.`;

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
  $('actualizado').textContent = `Último dato: ${nombreMes(ultimo.mes)}.`;
  calcular();

  let espera;
  new ResizeObserver(() => {
    clearTimeout(espera);
    espera = setTimeout(() => pintarHistoria($('desde').value, $('hasta').value), 100);
  }).observe($('historia'));
}

iniciar();
