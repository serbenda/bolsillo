// Página «¿Cuánto ha subido la compra?».

import { ALIMENTOS, PRODUCTOS, ranking, compraHoy, variacion, anual, costeAnual } from './compra.js';
import { tr, idioma, euros, porcentaje, formato } from './idioma.js';

const $ = (id) => document.getElementById(id);
const FICHERO = new URL('../../data/compra.json', import.meta.url);
const FICHERO_IPC = new URL('../../data/ipc.json', import.meta.url);
let ipcGeneral = null; // IPC general, para comparar (opcional)

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
    120: tr('hace 10 años', '10 years ago'),
  })[m];

const enElPeriodo = (m) =>
  ({
    1: tr('en el último mes', 'over the past month'),
    12: tr('en el último año', 'over the past year'),
    24: tr('en los últimos 2 años', 'over the past 2 years'),
    60: tr('en los últimos 5 años', 'over the past 5 years'),
    120: tr('en los últimos 10 años', 'over the past 10 years'),
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

const nombreDe = (p) => (idioma === 'en' ? p.en : p.es);
const anyoTexto = (a) => (a.parcial ? tr(`${a.anyo} (hasta ${nombreMes(a.hasta).split(' ')[0]})`, `${a.anyo} (to ${nombreMes(a.hasta).split(' ')[0]})`) : String(a.anyo));

function productoAnual() {
  const id = $('producto-anual').value;
  return id === 'alimentos'
    ? { id, nombre: tr('Toda la comida', 'All food'), serie: datos.alimentos }
    : (() => { const p = datos.productos.find((x) => x.id === id); return p && { id, nombre: nombreDe(p), serie: p.serie }; })();
}
const vistaAnual = () => document.querySelector('input[name=vista-anual]:checked').value;
const fila = (nombre, clase, ancho, cifra) => `<li class="producto">
        <span class="nombre">${nombre}</span>
        <span class="eje-barra ${clase}" aria-hidden="true"><span class="barra-var" style="width:${ancho}%"></span></span>
        <span class="cifra ${clase.replace(/coste|actual/g, '').trim()}">${cifra}</span>
      </li>`;

/** Gráfico de líneas: cada serie con 100 = su primer mes, para ver cuántas veces cuesta lo de entonces. */
function pintarGrafico(p) {
  const svg = $('grafico-compra');
  const comida = { clase: '', nombre: tr('Toda la comida', 'All food'), serie: datos.alimentos };
  const lineasG = [
    ...(p.id === 'alimentos' ? [] : [{ clase: 'producto-sel', nombre: p.nombre, serie: p.serie }]),
    comida,
    ...(ipcGeneral?.length ? [{ clase: 'general', nombre: tr('Todos los precios (IPC general)', 'All prices (headline CPI)'), serie: ipcGeneral }] : []),
  ];
  const inicio = datos.alimentos[0].mes;
  const meses = datos.alimentos.map((x) => x.mes);
  const indice = (serie) => {
    const mapa = new Map(serie.map((x) => [x.mes, x.valor]));
    const base = mapa.get(inicio);
    return base > 0 ? meses.map((m) => (mapa.has(m) ? (mapa.get(m) / base) * 100 : null)) : null;
  };
  const datosL = lineasG.map((l) => ({ ...l, v: indice(l.serie) })).filter((l) => l.v);
  const todos = datosL.flatMap((l) => l.v.filter((x) => x != null));
  const W = Math.max(svg.clientWidth, 300);
  const H = Math.max(svg.clientHeight, 180);
  const M = { t: 16, r: 46, b: 28, l: 40 };
  const min = Math.floor(Math.min(100, ...todos) / 50) * 50;
  const max = Math.ceil(Math.max(...todos) / 50) * 50;
  const x = (i) => M.l + (i / (meses.length - 1)) * (W - M.l - M.r);
  const y = (v) => M.t + ((max - v) / (max - min)) * (H - M.t - M.b);
  let g = '';
  for (let v = min; v <= max; v += 50) {
    g += `<line x1="${M.l}" x2="${W - M.r}" y1="${y(v)}" y2="${y(v)}" class="${v === 100 ? 'cero' : 'rejilla'}"/>`;
    g += `<text x="${M.l - 8}" y="${y(v) + 4}" class="eje" text-anchor="end">${v}</text>`;
  }
  const cada = W < 600 ? 6 : 3;
  meses.forEach((m, i) => {
    if (m.endsWith('-01') && Number(m.slice(0, 4)) % cada === 0) g += `<text x="${x(i)}" y="${H - 6}" class="eje" text-anchor="middle">${m.slice(0, 4)}</text>`;
  });
  // La línea elegida, la última para que quede encima
  for (const l of [...datosL].reverse()) {
    const puntos = l.v.map((v, i) => (v == null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`)).filter(Boolean).join(' ');
    g += `<polyline points="${puntos}" class="linea ${l.clase}"/>`;
  }
  const principal = datosL[0];
  const final = principal.v.at(-1);
  g += `<text x="${W - M.r + 6}" y="${y(final) + 4}" class="valor">${Math.round(final)}</text>`;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = g;

  $('leyenda-compra').innerHTML = datosL.map((l) => `<span><i class="${l.clase}"></i>${l.nombre}</span>`).join('');
  const veces = (Math.round(final) / 100).toLocaleString(idioma === 'en' ? 'en-GB' : 'es-ES', { maximumFractionDigits: 2 });
  const texto = tr(
    `Precio comparado con ${nombreMes(inicio)} (= 100). ${principal.nombre}: ${Math.round(final)} hoy, es decir, ${veces} veces lo que costaba entonces.`,
    `Price compared with ${nombreMes(inicio)} (= 100). ${principal.nombre}: ${Math.round(final)} today, or ${veces} times what it cost then.`
  );
  $('pie-grafico').textContent = texto;
  svg.setAttribute('aria-label', texto);
}

function pintarAnual() {
  const p = productoAnual();
  if (!p) return;
  pintarGrafico(p);
  const coste = vistaAnual() === 'coste';
  $('campo-hoy').hidden = !coste;
  if (coste) pintarCoste(p);
  else pintarSubida(p);
}

function pintarSubida(p) {
  const anos = anual(p.serie);
  if (!anos.length) return;
  const maximo = Math.max(0.01, ...anos.map((a) => Math.abs(a.variacion)));
  $('anual').innerHTML = anos
    .slice()
    .reverse()
    .map((a) => {
      const clase = a.variacion > 0.0005 ? 'sube' : a.variacion < -0.0005 ? 'baja' : '';
      return fila(anyoTexto(a), clase, ((Math.abs(a.variacion) / maximo) * 50).toFixed(1), conSigno(a.variacion));
    })
    .join('');

  // Resumen: total desde el primer dato, y el peor y el mejor año completos
  const serie = p.serie;
  const total = serie.at(-1).valor / serie[0].valor - 1;
  const completos = anos.filter((a) => !a.parcial);
  const peor = completos.reduce((m, a) => (a.variacion > m.variacion ? a : m), completos[0]);
  const mejor = completos.reduce((m, a) => (a.variacion < m.variacion ? a : m), completos[0]);
  const desde = nombreMes(serie[0].mes);
  const cienHoy = euros(100 * (1 + total), 0);
  const extremo = mejor.variacion < 0
    ? tr(`y el que más bajó, ${mejor.anyo} (${conSigno(mejor.variacion)})`, `and the biggest fall in ${mejor.anyo} (${conSigno(mejor.variacion)})`)
    : tr(`y el más tranquilo, ${mejor.anyo} (${conSigno(mejor.variacion)})`, `and the calmest year was ${mejor.anyo} (${conSigno(mejor.variacion)})`);
  $('resumen-anual').textContent = tr(
    `${p.nombre}: ${conSigno(total, 0)} desde ${desde}. Lo que costaba 100 € cuesta hoy ${cienHoy}. El año que más subió fue ${peor.anyo} (${conSigno(peor.variacion)}), ${extremo}.`,
    `${p.nombre}: ${conSigno(total, 0)} since ${desde}. What cost €100 now costs ${cienHoy}. The biggest rise was in ${peor.anyo} (${conSigno(peor.variacion)}), ${extremo}.`
  );
  $('nota-anual').textContent = tr(
    'Variación de precio de cada año, de diciembre a diciembre. El año en curso, desde diciembre hasta el último mes publicado.',
    'Price change each year, from December to December. The current year runs from December to the latest month published.'
  );
}

function pintarCoste(p) {
  const hoy = decimal($('gasto-hoy').value);
  if (!(hoy > 0)) {
    $('resumen-anual').textContent = tr('Escribe una cantidad mayor que cero, por ejemplo 100.', 'Enter an amount above zero, for example 100.');
    $('anual').innerHTML = '';
    return;
  }
  guardar('hoy', $('gasto-hoy').value);
  const costes = costeAnual(p.serie, hoy);
  if (!costes.length) return;
  const maximo = Math.max(...costes.map((c) => c.coste));
  const actual = costes.at(-1);
  $('anual').innerHTML = costes
    .slice()
    .reverse()
    .map((c) => fila(
      c === actual ? tr(`Hoy (${nombreMes(c.mes)})`, `Now (${nombreMes(c.mes)})`) : String(c.anyo),
      `coste${c === actual ? ' actual' : ''}`,
      ((c.coste / maximo) * 100).toFixed(1),
      euros(c.coste)
    ))
    .join('');

  const primero = costes[0];
  const hace5 = costes.find((c) => c.anyo === actual.anyo - 5);
  $('resumen-anual').textContent = tr(
    `${p.nombre}: lo que hoy te cuesta ${euros(hoy)} costaba ${euros(primero.coste)} en ${primero.anyo}${hace5 ? ` y ${euros(hace5.coste)} en ${hace5.anyo}` : ''}.`,
    `${p.nombre}: what costs you ${euros(hoy)} today cost ${euros(primero.coste)} in ${primero.anyo}${hace5 ? ` and ${euros(hace5.coste)} in ${hace5.anyo}` : ''}.`
  );
  $('nota-anual').textContent = tr(
    'Lo que costaba la misma compra en diciembre de cada año, según el IPC del INE. Hoy, el último mes publicado.',
    'What the same shop cost in December each year, based on INE’s CPI. Now means the latest month published.'
  );
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
    ipcGeneral = await fetch(FICHERO_IPC).then((r) => (r.ok ? r.json() : null)).then((j) => j?.serie ?? null).catch(() => null);
  } catch {
    $('titular').textContent = tr('¿Cuánto ha subido la compra?', 'How much have groceries gone up?');
    avisar(tr('Los precios de la compra no están disponibles ahora mismo. Vuelve a intentarlo en un rato.', "Grocery prices aren't available right now. Please try again shortly."));
    $('formulario').querySelectorAll('input').forEach((el) => (el.disabled = true));
    $('bloque-productos').hidden = true;
    $('bloque-anual').hidden = true;
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

  // Selector del año a año: toda la comida y cada producto, por orden alfabético
  const opciones = [...datos.productos].sort((a, b) => nombreDe(a).localeCompare(nombreDe(b), idioma));
  $('producto-anual').insertAdjacentHTML('beforeend', opciones.map((x) => `<option value="${x.id}">${nombreDe(x)}</option>`).join(''));
  const guardado = leer('producto');
  if (guardado && opciones.some((x) => x.id === guardado)) $('producto-anual').value = guardado;
  $('producto-anual').addEventListener('change', () => { guardar('producto', $('producto-anual').value); pintarAnual(); });
  const vista = leer('vista');
  const opcionVista = vista && document.querySelector(`input[name=vista-anual][value="${vista}"]`);
  if (opcionVista) opcionVista.checked = true;
  const hoyGuardado = leer('hoy');
  if (hoyGuardado) $('gasto-hoy').value = hoyGuardado;
  document.querySelectorAll('input[name=vista-anual]').forEach((i) =>
    i.addEventListener('change', () => { guardar('vista', i.value); pintarAnual(); })
  );
  $('gasto-hoy').addEventListener('input', pintarAnual);

  pintarCabecera();
  pintarTodo();
  pintarAnual();
  $('actualizado').textContent = tr(`Último dato: ${nombreMes(datos.alimentos.at(-1).mes)}.`, `Latest figure: ${nombreMes(datos.alimentos.at(-1).mes)}.`);
}

iniciar();
