// Descarga del Banco de España el tipo de las subastas de Letras del Tesoro (3, 6, 9 y 12 meses)
// y la rentabilidad del bono a 10 años, y lo guarda en data/ahorro.json.
// Si falla, se mantienen los datos anteriores.

import { writeFile, mkdir } from 'node:fs/promises';
import { PLAZOS, BONO10, urlSerieBde, parsearBde } from '../assets/js/ahorro.js';
import { anotar } from './estado.mjs';

const salida = new URL('../data/ahorro.json', import.meta.url);
const CABECERAS = { Accept: 'application/json', 'User-Agent': 'bolsillo (github.com/serbenda/bolsillo)' };

async function serie(codigo, minimo) {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(urlSerieBde(codigo), { headers: CABECERAS });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const s = parsearBde(await r.json());
      if (s.length >= minimo) return s;
      throw new Error(`solo ${s.length} datos`);
    } catch (e) {
      console.warn(`${codigo}, intento ${intento}: ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 3000 * intento));
    }
  }
  return null;
}

const letras = {};
for (const p of PLAZOS) {
  const s = await serie(p.serie, 6);
  if (s) letras[p.id] = s;
}
// El bono a 10 años tiene un dato por día: basta con las últimas semanas
const bono = (await serie(BONO10.serie, 10))?.slice(-60) ?? null;

if (!letras.m12 || Object.keys(letras).length < 3) {
  await anotar('ahorro', false, `El Banco de España devolvió ${Object.keys(letras).length} de ${PLAZOS.length} plazos de Letras`);
  console.warn('Ahorro: se mantienen los datos anteriores');
  process.exit(0);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(salida, JSON.stringify({ actualizado: new Date().toISOString(), letras, bono10: bono }));
const u = letras.m12.at(-1);
console.log(`Ahorro: Letras a 12 meses ${u.valor} % (${u.fecha})`);
await anotar('ahorro', true, `Letras a 12 meses ${u.valor} % (${u.fecha})`);
