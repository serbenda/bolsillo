// Descarga el IPC general nacional del INE y lo guarda en data/ipc.json.
// Si el INE falla, se mantienen los datos de la publicación anterior.

import { writeFile, mkdir } from 'node:fs/promises';
import { urlIpc, parsearIpc } from '../assets/js/ipc.js';
import { anotar } from './estado.mjs';

const salida = new URL('../data/ipc.json', import.meta.url);

let serie = [];
for (let intento = 1; intento <= 3 && serie.length < 100; intento++) {
  try {
    const r = await fetch(urlIpc(), { headers: { Accept: 'application/json', 'User-Agent': 'bolsillo (github.com/serbenda/bolsillo)' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    serie = parsearIpc(await r.json());
  } catch (e) {
    console.warn(`Intento ${intento}: ${e.message}`);
    await new Promise((ok) => setTimeout(ok, 4000 * intento));
  }
}

if (serie.length < 100) {
  await anotar('ipc', false, `El INE devolvió ${serie.length} meses`);
  console.warn('IPC: se mantienen los datos anteriores');
  process.exit(0);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(salida, JSON.stringify({ actualizado: new Date().toISOString(), serie }));
console.log(`IPC: ${serie.length} meses, último ${serie.at(-1).mes} = ${serie.at(-1).valor}`);
await anotar('ipc', true, `${serie.length} meses, último ${serie.at(-1).mes}`);
