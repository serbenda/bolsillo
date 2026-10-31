// Recibo del día de la portada.

import { cargarLuz, formatoPrecio, horaTexto } from './datos-luz.js';
import { horaMadrid } from './ree.js';
import { mejorTramo } from './ventana.js';
import { factorImpuestos } from './impuestos.js';
import { interanual } from './ipc.js';
import { variacion } from './compra.js';
import { tr, numero, porcentaje, formato } from './idioma.js';

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
