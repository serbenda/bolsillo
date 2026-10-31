// Avisa cuando caduca un precio regulado de la calefacción (butano o TUR del gas), que se copian del BOE a mano.
// Anota el estado: si hay algo caducado, la Action abre un issue para actualizarlo.

import { caducados } from '../assets/js/calefaccion.js';
import { anotar } from './estado.mjs';

const hoy = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(new Date());
const avisos = caducados(hoy);
if (avisos.length) {
  console.warn(`Calefacción: toca actualizar ${avisos.join(' y ')} en assets/js/calefaccion.js`);
  await anotar('calefaccion', false, `Toca actualizar ${avisos.join(' y ')} con el BOE nuevo (assets/js/calefaccion.js)`);
} else {
  await anotar('calefaccion', true, 'precios regulados vigentes');
}
