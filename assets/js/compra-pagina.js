// Página «¿Cuánto ha subido la compra?».

import { PRODUCTOS, ranking, compraHoy, variacion } from './compra.js';
import { tr, idioma, euros, porcentaje, formato } from './idioma.js';

const $ = (id) => document.getElementById(id);
const FICHERO = new URL('../../data/compra.json', import.meta.url);

const FORMATO_MES = formato({ month: 'long', year: 'numeric', timeZone: 'UTC' });
const nombreMes = (mes) => FORMATO_MES.format(new Date(`${mes}-01T00:00:00Z`));
const conSigno = (v, dec = 1) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${porcentaje(Math.abs(v * 100), dec)}`;
const decimal = (s) => {
  const t = String(s).replace(/\s/g, '');
  const ultimo = Math.max(t.lastIndexOf(','), t.lastIndexOf('.'));
  if (ultimo < 0) return Number(t);
  const dec = t.slice(ultimo + 1);
  if (dec.length === 3 && !/[.,]/.test(t.slice(0, ultimo))) return Number(t.replace(/[.,]/g, ''));
  return Number(`${t.slice(0, ultimo).replace(/[.,]/g, '')}.${dec}`);
};

const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.compra.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.compra.${k}`); } catch { return null; } };

let datos = null; // { alimentos, productos: [{ id, serie, es, en }] }

const periodo = () => Number(document.querySelector('input[name=periodo]:checked').value);
const hace = (m) =>
  ({
    1: tr('hace un mes', 'a month ago'),
    12: tr('hace un año', 'a year ago'),
    24: tr('hace 2 años', '2 years ago'),
    60: tr('hace 5 años', '5 years ago'),
  })[m];

const enElPeriodo = (m) =>
  ({
    1: tr('en el último mes', 'over the past month'),
    12: tr('en el último año', 'over the past year'),
    24: tr('en los últimos 2 años', 'over the past 2 years'),
    60: tr('en los últimos 5 años', 'over the past 5 years'),
  })[m];

function avisar(texto) {
  $('mensaje').textContent = texto ?? '';
  $('mensaje').hidden = !texto;
}

function pintarCabecera() {
  // El titular siempre compara con hace un año: es la referencia habitual de los precios
  const v = variacion(datos.alimentos, 12);
  if (!v) return;
  $('titular').textContent = v.variacion >= 0
    ? tr(`La compra cuesta hoy un ${porcentaje(v.variacion * 100)} más que hace un año.`, `Groceries cost ${porcentaje(v.variacion * 100)} more today than a year ago.`)
    : tr(`La compra cuesta hoy un ${porcentaje(-v.variacion * 100)} menos que hace un año.`, `Groceries cost ${porcentaje(-v.variacion * 100)} less today than a year ago.`);
  const r = ranking(datos.productos, 12);
  const sube = r[0];
  const baja = r.at(-1);
  const nombre = (p) => (idioma === 'en' ? p.en : p.es).toLowerCase();
  $('entradilla').textContent = tr(
    `Dato de ${nombreMes(v.hasta)} del INE. Lo que más ha subido en un año: ${nombre(sube)} (${conSigno(sube.variacion)}). ${baja.variacion < 0 ? `Lo que más ha bajado: ${nombre(baja)} (${conSigno(baja.variacion)}).` : ''}`,
    `INE figure for ${nombreMes(v.hasta)}. Biggest rise in a year: ${nombre(sube)} (${conSigno(sube.variacion)}). ${baja.variacion < 0 ? `Biggest fall: ${nombre(baja)} (${conSigno(baja.variacion)}).` : ''}`
  ).trim();
}

function pintarCalculadora() {
  const m = periodo();
  const gasto = decimal($('gasto').value);
  $('etiqueta-gasto').textContent = tr(`Lo que gastabas en la compra ${hace(m)}`, `What you spent on groceries ${hace(m)}`);
  const c = compraHoy(datos.alimentos, gasto, m);
  if (!(gasto > 0) || !c) {
    $('resultado').textContent = tr('Escribe una cantidad mayor que cero, por ejemplo 100.', 'Enter an amount above zero, for example 100.');
    $('resultado-detalle').textContent = '';
    return;
  }
  guardar('gasto', $('gasto').value);
  const dif = c.hoy - gasto;
  $('resultado').textContent = tr(
    `La misma compra hoy te cuesta ${euros(c.hoy)}.`,
    `The same shop costs ${euros(c.hoy)} today.`
  );
  $('resultado-detalle').textContent = Math.abs(dif) < 0.005
    ? tr('Lo mismo que entonces.', 'The same as then.')
    : tr(
        `${euros(Math.abs(dif))} ${dif > 0 ? 'más' : 'menos'} que en ${nombreMes(c.desde)}, según el precio medio de los alimentos (${conSigno(c.variacion)}). Si compras cada semana, son unos ${euros(Math.abs(dif) * 52, 0)} ${dif > 0 ? 'más' : 'menos'} al año.`,
        `${euros(Math.abs(dif))} ${dif > 0 ? 'more' : 'less'} than in ${nombreMes(c.desde)}, based on the average price of food (${conSigno(c.variacion)}). If you shop weekly, that's about ${euros(Math.abs(dif) * 52, 0)} ${dif > 0 ? 'more' : 'less'} a year.`
      );
}

function pintarProductos() {
  const m = periodo();
  const r = ranking(datos.productos, m);
  const maximo = Math.max(0.01, ...r.map((p) => Math.abs(p.variacion)));
  $('t-productos').textContent = tr(`Lo que ha subido y bajado ${enElPeriodo(m)}`, `What's gone up and down ${enElPeriodo(m)}`);
  $('productos').innerHTML = r
    .map((p) => {
      const clase = p.variacion > 0.0005 ? 'sube' : p.variacion < -0.0005 ? 'baja' : '';
      const ancho = ((Math.abs(p.variacion) / maximo) * 50).toFixed(1);
      return `<li class="producto">
        <span class="nombre">${idioma === 'en' ? p.en : p.es}</span>
        <span class="eje-barra ${clase}" aria-hidden="true"><span class="barra-var" style="width:${ancho}%"></span></span>
        <span class="cifra ${clase}">${conSigno(p.variacion)}</span>
      </li>`;
    })
    .join('');
}

function pintarTodo() {
  pintarCalculadora();
  pintarProductos();
}

async function iniciar() {
  try {
    const r = await fetch(FICHERO); // precargado desde el HTML
    if (!r.ok) throw new Error(r.status);
    const json = await r.json();
    const textos = Object.fromEntries(PRODUCTOS.map((p) => [p.id, p]));
    datos = {
      alimentos: json.alimentos,
      productos: json.productos.filter((p) => textos[p.id]).map((p) => ({ ...textos[p.id], serie: p.serie })),
    };
    if (!datos.alimentos?.length || !datos.productos.length) throw new Error('vacío');
  } catch {
    $('titular').textContent = tr('¿Cuánto ha subido la compra?', 'How much have groceries gone up?');
    avisar(tr('Los precios de la compra no están disponibles ahora mismo. Vuelve a intentarlo en un rato.', "Grocery prices aren't available right now. Please try again shortly."));
    $('formulario').querySelectorAll('input').forEach((el) => (el.disabled = true));
    $('bloque-productos').hidden = true;
    return;
  }

  const p = leer('periodo');
  const opcion = p && document.querySelector(`input[name=periodo][value="${p}"]`);
  if (opcion) opcion.checked = true;
  const g = leer('gasto');
  if (g) $('gasto').value = g;

  document.querySelectorAll('input[name=periodo]').forEach((i) =>
    i.addEventListener('change', () => { guardar('periodo', i.value); pintarTodo(); })
  );
  $('gasto').addEventListener('input', pintarCalculadora);
  $('formulario').addEventListener('submit', (e) => e.preventDefault());

  pintarCabecera();
  pintarTodo();
  $('actualizado').textContent = tr(`Último dato: ${nombreMes(datos.alimentos.at(-1).mes)}.`, `Latest figure: ${nombreMes(datos.alimentos.at(-1).mes)}.`);
}

iniciar();
