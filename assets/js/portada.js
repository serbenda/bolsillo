// Recibo del día de la portada.

import { cargarLuz, formatoPrecio, horaTexto } from './datos-luz.js';
import { horaMadrid } from './ree.js';
import { mejorTramo } from './ventana.js';
import { factorImpuestos } from './impuestos.js';
import { interanual } from './ipc.js';
import { variacion } from './compra.js';
import { tr, numero, porcentaje, formato, euros } from './idioma.js';
import { indiceAplicable, rentaActualizada } from './alquiler.js';
import { ganancia, PLAZOS } from './ahorro.js';
import { cuotaMensual } from './euribor.js';
import { BUTANO, aplicar as aplicarCalefaccion } from './calefaccion.js';
import { mesesAntes } from './compra.js';

const $ = (id) => document.getElementById(id);
const DATOS = new URL('../../data/', import.meta.url);
const json = (ruta) => fetch(new URL(ruta, DATOS), { cache: 'no-cache' }).then((r) => r.json());

$('recibo-fecha').textContent = formato({ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Madrid' }).format(new Date());

cargarLuz().then(({ hoy, manana, fechaHoy }) => {
  if (!hoy) return;
  const h = horaMadrid();
  const actual = hoy.find((x) => x.hora === h);
  if (actual) $('r-luz').textContent = `${formatoPrecio(actual.precio * factorImpuestos(fechaHoy))} €/kWh`;
  const mejor = mejorTramo([...hoy.filter((x) => x.hora >= h), ...(manana ?? [])], 1);
  if (mejor) {
    const dia = mejor.inicio.fecha === fechaHoy ? tr('hoy', 'today') : tr('mañana', 'tomorrow');
    $('r-hora').textContent = `${dia}, ${horaTexto(mejor.inicio.hora)}`;
  }
});

json('gasolina/indice.json').then(({ medias }) => {
  if (medias?.g95) $('r-g95').textContent = `${numero(medias.g95, 3)} €/l`;
  if (medias?.diesel) $('r-diesel').textContent = `${numero(medias.diesel, 3)} €/l`;
}).catch(() => {});

json('calefaccion.json').then(aplicarCalefaccion).catch(() => {}).finally(() => { $('r-butano').textContent = euros(BUTANO.precio); });

json('ahorro.json').then(({ letras }) => {
  const u = letras?.m12?.at(-1);
  if (u) $('r-letras').textContent = porcentaje(u.valor, 2);
}).catch(() => {});

json('alquiler.json').then(({ irav }) => {
  const u = irav?.at(-1);
  if (u) $('r-alquiler').textContent = porcentaje(u.valor, 2);
}).catch(() => {});

json('ipc.json').then(({ serie }) => {
  const t = interanual(serie).at(-1);
  if (t) $('r-ipc').textContent = porcentaje(t.tasa * 100, 1);
}).catch(() => {});

json('compra.json').then(({ alimentos }) => {
  const v = variacion(alimentos, 12);
  if (v) $('r-compra').textContent = `${v.variacion >= 0 ? '+' : '−'}${porcentaje(Math.abs(v.variacion) * 100, 1)}`;
}).catch(() => {});

json('euribor.json').then(({ serie }) => {
  const u = serie?.at(-1);
  if (!u) return;
  const mes = formato({ month: 'short', timeZone: 'UTC' }).format(new Date(`${u.mes}-01T00:00:00Z`)).replace('.', '');
  $('r-euribor').textContent = `${porcentaje(u.valor, 3)} (${mes})`;
}).catch(() => {});

/* ---------- Tu bolsillo: lo que la persona ha escrito en cada sección, con los datos de hoy ---------- */

const leerLocal = (k) => { try { return localStorage.getItem(`bolsillo.${k}`); } catch { return null; } };
const decimal = (s) => {
  const t = String(s ?? '').replace(/\s/g, '');
  if (!t) return NaN;
  const ultimo = Math.max(t.lastIndexOf(','), t.lastIndexOf('.'));
  if (ultimo < 0) return Number(t);
  const dec = t.slice(ultimo + 1);
  if (dec.length === 3 && !/[.,]/.test(t.slice(0, ultimo))) return Number(t.replace(/[.,]/g, ''));
  return Number(`${t.slice(0, ultimo).replace(/[.,]/g, '')}.${dec}`);
};
const enlace = (ruta) => new URL(`../../${document.documentElement.lang === 'en' ? 'en/' : ''}${ruta}`, import.meta.url).pathname;
const NOMBRE_C = { g95: ['gasolina 95', '95 petrol'], g98: ['gasolina 98', '98 petrol'], diesel: ['diésel', 'diesel'], dieselPlus: ['diésel premium', 'premium diesel'], glp: ['GLP', 'LPG'] };
const nombreProvincia = (n) => String(n ?? '').replace(/^(.+?)\s*\(([^)]+)\)$/, (_, nombre, art) => `${art.charAt(0).toUpperCase()}${art.slice(1).toLowerCase()} ${nombre}`);

async function miBolsillo() {
  const lineas = [];
  const ORDEN = ['gasolina/', 'compra/', 'alquiler/', 'hipoteca/', 'ahorro/'];
  const linea = (ruta, texto) => lineas.push({ ruta, html: `<li><a href="${enlace(ruta)}">${texto.replace(/^(<strong>)(\p{Ll})/u, (_, a, b) => a + b.toUpperCase())}</a></li>` });
  const tareas = [];

  // Gasolina: la media de hoy en la provincia del código postal buscado
  const cp = leerLocal('cp');
  if (cp && /^\d{5}$/.test(cp)) {
    const c = leerLocal('combustible') ?? 'g95';
    tareas.push(json('gasolina/indice.json').then((ind) => {
      const p = ind.provincias?.[cp.slice(0, 2)];
      const precio = p?.medias?.[c];
      const media = ind.medias?.[c];
      if (typeof precio !== 'number') return;
      const dif = typeof media === 'number' ? (precio - media) * 100 : 0;
      const n = tr(NOMBRE_C[c]?.[0] ?? c, NOMBRE_C[c]?.[1] ?? c);
      linea('gasolina/', tr(
        `<strong>${n} en ${nombreProvincia(p.nombre)}: ${numero(precio, 3)} €/l</strong> de media, ${numero(Math.abs(dif), 1)} céntimos ${dif >= 0 ? 'por encima' : 'por debajo'} de la de España. Mira las más baratas cerca de ${cp}.`,
        `<strong>${n} in ${nombreProvincia(p.nombre)}: ${numero(precio, 3)} €/l</strong> on average, ${numero(Math.abs(dif), 1)} cents ${dif >= 0 ? 'above' : 'below'} Spain's. See the cheapest near ${cp}.`
      ));
    }).catch(() => {}));
  }

  // Compra: lo que gastabas hace un año, hoy
  const gasto = decimal(leerLocal('compra.gasto'));
  if (gasto > 0) {
    tareas.push(json('compra.json').then(({ alimentos }) => {
      const v = variacion(alimentos, 12);
      if (!v) return;
      linea('compra/', tr(
        `<strong>Tu compra de ${euros(gasto)} hace un año cuesta hoy ${euros(gasto * (1 + v.variacion))}</strong>.`,
        `<strong>Your ${euros(gasto)} shop from a year ago costs ${euros(gasto * (1 + v.variacion))} today</strong>.`
      ));
    }).catch(() => {}));
  }

  // Alquiler: lo máximo que te pueden subir en el mes de tu subida
  const renta = decimal(leerLocal('alquiler.renta'));
  const mesSubida = leerLocal('alquiler.mes-subida');
  if (renta > 0) {
    tareas.push(json('alquiler.json').then(({ irav }) => {
      const mes = mesSubida ?? mesesAntes(irav.at(-1).mes, -2);
      const ind = indiceAplicable(irav, mes);
      if (!ind || leerLocal('alquiler.firma') === 'antiguo') return;
      const { subida } = rentaActualizada(renta, ind.tasa);
      const nombreMes = formato({ month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${mes}-01T00:00:00Z`));
      linea('alquiler/', tr(
        `<strong>Tu alquiler de ${euros(renta)}: como mucho ${euros(subida)} más al mes</strong> si te lo suben en ${nombreMes}.`,
        `<strong>Your ${euros(renta)} rent: at most ${euros(subida)} more a month</strong> if it goes up in ${nombreMes}.`
      ));
    }).catch(() => {}));
  }

  // Hipoteca: la cuota con el último Euríbor
  const capital = decimal(leerLocal('hipoteca.capital'));
  const anos = decimal(leerLocal('hipoteca.anos'));
  const diferencial = decimal(leerLocal('hipoteca.diferencial'));
  if (capital > 0 && anos > 0 && Number.isFinite(diferencial)) {
    tareas.push(json('euribor.json').then(({ serie }) => {
      const e = serie.at(-1);
      const cuota = cuotaMensual(capital, Math.round(anos * 12), e.valor + diferencial);
      linea('hipoteca/', tr(
        `<strong>Tu hipoteca: ${euros(cuota)} al mes</strong> con el último Euríbor (${porcentaje(e.valor, 3)}).`,
        `<strong>Your mortgage: ${euros(cuota)} a month</strong> with the latest Euribor (${porcentaje(e.valor, 3)}).`
      ));
    }).catch(() => {}));
  }

  // Ahorro: lo que ganarías en Letras con tu cantidad y tu plazo
  const cantidad = decimal(leerLocal('ahorro.cantidad'));
  if (cantidad > 0) {
    const plazo = PLAZOS.find((p) => p.id === leerLocal('ahorro.plazo')) ?? PLAZOS.at(-1);
    tareas.push(json('ahorro.json').then(({ letras }) => {
      const u = letras?.[plazo.id]?.at(-1);
      if (!u) return;
      const g = ganancia(cantidad, u.valor, plazo.dias);
      linea('ahorro/', tr(
        `<strong>Tus ${euros(cantidad, 0)} en Letras a ${plazo.meses} meses: unos ${euros(g.neto)} limpios</strong> (${porcentaje(u.valor, 2)}).`,
        `<strong>Your ${euros(cantidad, 0)} in ${plazo.meses}-month bills: about ${euros(g.neto)} after tax</strong> (${porcentaje(u.valor, 2)}).`
      ));
    }).catch(() => {}));
  }

  await Promise.all(tareas);
  if (!lineas.length) return;
  $('mi-lista').innerHTML = lineas.sort((a, b) => ORDEN.indexOf(a.ruta) - ORDEN.indexOf(b.ruta)).map((l) => l.html).join('');
  $('mi-bolsillo').hidden = false;
}

miBolsillo();
