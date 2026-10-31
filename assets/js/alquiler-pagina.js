// Página «¿Cuánto me pueden subir el alquiler?».

import { indiceAplicable, rentaActualizada } from './alquiler.js';
import { mesesAntes } from './compra.js';
import { interanual } from './ipc.js';
import { fechaMadrid } from './ree.js';
import { graficoLineas } from './grafico-lineas.js';
import { tr, euros, porcentaje, formato } from './idioma.js';

const $ = (id) => document.getElementById(id);
const DATOS = new URL('../../data/', import.meta.url);
const FORMATO_MES = formato({ month: 'long', year: 'numeric', timeZone: 'UTC' });
const nombreMes = (mes) => FORMATO_MES.format(new Date(`${mes}-01T00:00:00Z`));
const soloMes = (mes) => nombreMes(mes).split(' ')[0];
const pct = (t) => porcentaje(t * 100, 2);
const decimal = (s) => {
  const t = String(s).replace(/\s/g, '');
  const ultimo = Math.max(t.lastIndexOf(','), t.lastIndexOf('.'));
  if (ultimo < 0) return Number(t);
  const dec = t.slice(ultimo + 1);
  if (dec.length === 3 && !/[.,]/.test(t.slice(0, ultimo))) return Number(t.replace(/[.,]/g, ''));
  return Number(`${t.slice(0, ultimo).replace(/[.,]/g, '')}.${dec}`);
};
const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.alquiler.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.alquiler.${k}`); } catch { return null; } };

let irav = [];
let ipc = []; // inflación interanual [{ mes, valor (%) }]

function avisar(texto) {
  $('mensaje').textContent = texto ?? '';
  $('mensaje').hidden = !texto;
}

/** Dato aplicable del IPC (contratos antiguos): mismo criterio, el de dos meses antes. */
function ipcAplicable(mes) {
  return indiceAplicable(ipc, mes);
}

function calcular() {
  const renta = decimal($('renta').value);
  const mes = $('mes-subida').value;
  const nuevo = document.querySelector('input[name=firma]:checked').value === 'nuevo';
  if (!(renta > 0)) {
    $('resultado').textContent = tr('Escribe lo que pagas, por ejemplo 800.', 'Enter your rent, for example 800.');
    $('resultado-detalle').textContent = '';
    return;
  }
  for (const k of ['renta', 'mes-subida']) guardar(k, $(k).value);
  guardar('firma', nuevo ? 'nuevo' : 'antiguo');

  const ind = nuevo ? indiceAplicable(irav, mes) : ipcAplicable(mes);
  if (!ind) {
    $('resultado').textContent = tr('No hay datos para ese mes.', 'No data for that month.');
    $('resultado-detalle').textContent = '';
    return;
  }
  const { nueva, subida } = rentaActualizada(renta, ind.tasa);
  $('resultado').textContent = subida > 0
    ? tr(`Te pueden subir como mucho ${euros(subida)} al mes: de ${euros(renta)} a ${euros(nueva)}.`, `Your rent can go up by at most ${euros(subida)} a month: from ${euros(renta)} to ${euros(nueva)}.`)
    : tr('Ese mes no te pueden subir el alquiler.', "Your rent can't go up that month.");
  const anual = tr(` Son ${euros(subida * 12)} más al año.`, ` That's ${euros(subida * 12)} more a year.`);
  const nombre = nuevo ? tr('límite oficial (IRAV)', 'official cap (IRAV)') : tr('IPC', 'CPI');
  const base = ind.estimado
    ? tr(
        `Aún no se ha publicado el dato que valdrá en ${soloMes(mes)}. Con el último ${nombre}, de ${nombreMes(ind.mes)} (${pct(ind.tasa)}), sería esto; puede cambiar un poco.`,
        `The figure for ${soloMes(mes)} hasn't been published yet. This uses the latest ${nombre}, for ${nombreMes(ind.mes)} (${pct(ind.tasa)}); it may change slightly.`
      )
    : tr(
        `Se aplica el ${nombre} de ${nombreMes(ind.mes)}, ${pct(ind.tasa)}: el último publicado antes de la subida.`,
        `The ${nombre} for ${nombreMes(ind.mes)} applies, ${pct(ind.tasa)}: the latest published before the increase.`
      );
  const antiguo = nuevo ? '' : tr(
    ' Esto vale si tu contrato dice que se actualiza con el IPC; si dice otra cosa, se aplica lo pactado.',
    ' This applies if your contract says rent is updated with CPI; if it says something else, that applies instead.'
  );
  $('resultado-detalle').textContent = base + (subida > 0 ? anual : '') + antiguo + tr(' Si tu contrato no dice nada de actualizar la renta, no te la pueden subir.', " If your contract says nothing about updating the rent, it can't go up.");
}

function pintarHistoria() {
  const desde = irav[0].mes;
  const series = [
    { clase: 'producto-sel', puntos: irav },
    { clase: 'general', puntos: ipc.filter((p) => p.mes >= desde) },
  ];
  graficoLineas($('historia'), series, { paso: 1, sufijo: '' });
  const u = irav.at(-1);
  const i = ipc.find((p) => p.mes === u.mes);
  const texto = tr(
    `Variación anual en %. En ${nombreMes(u.mes)} el límite del alquiler era del ${porcentaje(u.valor, 2)}${i ? ` y la inflación del ${porcentaje(i.valor, 1)}` : ''}.`,
    `Annual change in %. In ${nombreMes(u.mes)} the rent cap was ${porcentaje(u.valor, 2)}${i ? ` and inflation ${porcentaje(i.valor, 1)}` : ''}.`
  );
  $('pie-historia').textContent = texto;
  $('historia').setAttribute('aria-label', texto);
}

async function iniciar() {
  try {
    const [a, b] = await Promise.all([fetch(new URL('alquiler.json', DATOS)), fetch(new URL('ipc.json', DATOS))]);
    if (!a.ok) throw new Error(a.status);
    irav = (await a.json()).irav ?? [];
    if (b.ok) ipc = interanual((await b.json()).serie ?? []).map((t) => ({ mes: t.mes, valor: Number((t.tasa * 100).toFixed(4)) }));
    if (irav.length < 2) throw new Error('vacío');
  } catch {
    $('titular').textContent = tr('¿Cuánto me pueden subir el alquiler?', 'How much can my rent go up?');
    avisar(tr('Los datos del alquiler no están disponibles ahora mismo. Vuelve a intentarlo en un rato.', "Rent data isn't available right now. Please try again shortly."));
    $('formulario').querySelectorAll('input, select').forEach((el) => (el.disabled = true));
    $('bloque-historia').hidden = true;
    return;
  }

  // Titular: el último dato publicado vale para las subidas de dos meses después
  const u = irav.at(-1);
  const mesAplica = mesesAntes(u.mes, -2);
  $('titular').textContent = tr(
    `Si te suben el alquiler en ${soloMes(mesAplica)}, como mucho un ${porcentaje(u.valor, 2)}.`,
    `If your rent goes up in ${soloMes(mesAplica)}, it can rise by at most ${porcentaje(u.valor, 2)}.`
  );
  $('entradilla').textContent = tr(
    `Es el límite oficial del INE (IRAV) de ${nombreMes(u.mes)}, para contratos de vivienda firmados desde el 26 de mayo de 2023. Calcula lo tuyo en euros.`,
    `It's INE's official cap (IRAV) for ${nombreMes(u.mes)}, for housing contracts signed since 26 May 2023. Work out yours in euros.`
  );

  // Meses: del primero con límite (enero de 2025) a un año vista
  const hoy = fechaMadrid(0).slice(0, 7);
  const ultimoMes = mesesAntes(hoy, -12);
  const meses = [];
  for (let m = mesesAntes(irav[0].mes, -2); m <= ultimoMes; m = mesesAntes(m, -1)) meses.push(m);
  for (const m of meses.reverse()) $('mes-subida').add(new Option(nombreMes(m).replace(/^\p{L}/u, (c) => c.toUpperCase()), m));
  $('mes-subida').value = meses.includes(mesAplica) ? mesAplica : meses[0];

  const r = leer('renta'); if (r) $('renta').value = r;
  const m = leer('mes-subida'); if (m && meses.includes(m)) $('mes-subida').value = m;
  const f = leer('firma'); const op = f && document.querySelector(`input[name=firma][value="${f}"]`); if (op) op.checked = true;
  $('renta').addEventListener('input', calcular);
  $('mes-subida').addEventListener('input', calcular);
  document.querySelectorAll('input[name=firma]').forEach((i) => i.addEventListener('change', calcular));
  $('formulario').addEventListener('submit', (e) => e.preventDefault());
  $('actualizado').textContent = tr(`Último dato: ${nombreMes(u.mes)}.`, `Latest figure: ${nombreMes(u.mes)}.`);
  calcular();

  let espera;
  new ResizeObserver(() => { clearTimeout(espera); espera = setTimeout(pintarHistoria, 100); }).observe($('historia'));
}

iniciar();
