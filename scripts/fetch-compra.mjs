// Descarga del INE el IPC de los alimentos y de cada producto de la compra (últimos ~10 años)
// y lo guarda en data/compra.json. Si el INE falla, se mantienen los datos anteriores.

import { writeFile, mkdir } from 'node:fs/promises';
import { ALIMENTOS, PRODUCTOS, urlSerie } from '../assets/js/compra.js';
import { parsearIpc } from '../assets/js/ipc.js';
import { anotar } from './estado.mjs';

const salida = new URL('../data/compra.json', import.meta.url);
const CABECERAS = { Accept: 'application/json', 'User-Agent': 'bolsillo (github.com/serbenda/bolsillo)' };

async function serie(cod) {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(urlSerie(cod), { headers: CABECERAS });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const s = parsearIpc(await r.json());
      if (s.length >= 24) return s;
      throw new Error(`solo ${s.length} meses`);
    } catch (e) {
      console.warn(`${cod}, intento ${intento}: ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 3000 * intento));
    }
  }
  return null;
}

const alimentos = await serie(ALIMENTOS.cod);
const productos = [];
for (const p of PRODUCTOS) {
  const s = await serie(p.cod);
  if (s) productos.push({ id: p.id, serie: s });
}

if (!alimentos || productos.length < PRODUCTOS.length * 0.8) {
  await anotar('compra', false, `El INE devolvió ${productos.length} de ${PRODUCTOS.length} productos${alimentos ? '' : ' y no dio el total de alimentos'}`);
  console.warn('Compra: se mantienen los datos anteriores');
  process.exit(0);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(salida, JSON.stringify({ actualizado: new Date().toISOString(), alimentos, productos }));
console.log(`Compra: ${productos.length} productos, último mes ${alimentos.at(-1).mes}`);
await anotar('compra', true, `${productos.length} productos, último ${alimentos.at(-1).mes}`);
