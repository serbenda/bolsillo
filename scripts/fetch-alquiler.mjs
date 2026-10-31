// Descarga del INE el índice de referencia para actualizar los alquileres de vivienda (IRAV)
// y lo guarda en data/alquiler.json. Si el INE falla, se mantienen los datos anteriores.

import { writeFile, mkdir } from 'node:fs/promises';
import { urlIrav } from '../assets/js/alquiler.js';
import { parsearIpc } from '../assets/js/ipc.js';
import { anotar } from './estado.mjs';

const salida = new URL('../data/alquiler.json', import.meta.url);
const CABECERAS = { Accept: 'application/json', 'User-Agent': 'bolsillo (github.com/serbenda/bolsillo)' };

let irav = [];
for (let intento = 1; intento <= 3 && irav.length < 12; intento++) {
  try {
    const r = await fetch(urlIrav(), { headers: CABECERAS });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    irav = parsearIpc(await r.json()); // mismo formato que el resto de series del INE
  } catch (e) {
    console.warn(`IRAV, intento ${intento}: ${e.message}`);
    await new Promise((ok) => setTimeout(ok, 3000 * intento));
  }
}

if (irav.length < 12) {
  await anotar('alquiler', false, `El INE devolvió ${irav.length} meses del IRAV`);
  console.warn('Alquiler: se mantienen los datos anteriores');
  process.exit(0);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(salida, JSON.stringify({ actualizado: new Date().toISOString(), irav }));
console.log(`Alquiler: ${irav.length} meses, último ${irav.at(-1).mes} = ${irav.at(-1).valor} %`);
await anotar('alquiler', true, `${irav.length} meses, último ${irav.at(-1).mes}`);
