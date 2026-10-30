// Descarga la serie histórica del Euríbor a un año del Banco de España y la guarda en data/euribor.json.
// Lo ejecuta la GitHub Action antes de publicar la web. Si falla, se mantienen los datos anteriores.

import { writeFile, mkdir } from 'node:fs/promises';
import { urlEuribor, parsearEuribor } from '../assets/js/euribor.js';
import { anotar } from './estado.mjs';

const salida = new URL('../data/euribor.json', import.meta.url);

async function descargar() {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      // El BdE rechaza peticiones sin User-Agent ni Accept.
      const r = await fetch(urlEuribor('MAX'), {
        headers: { Accept: 'application/json', 'User-Agent': 'bolsillo (github.com/serbenda/bolsillo)' },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return parsearEuribor(await r.json());
    } catch (e) {
      console.warn(`Intento ${intento}: ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 5000 * intento));
    }
  }
  return [];
}

const serie = await descargar();
if (serie.length < 100) {
  console.warn(`Euríbor: solo ${serie.length} meses; se mantienen los datos anteriores`);
  await anotar('euribor', false, `El Banco de España devolvió ${serie.length} meses`);
  process.exit(0);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(salida, JSON.stringify({ actualizado: new Date().toISOString(), serie }));
const ultimo = serie.at(-1);
console.log(`Euríbor: ${serie.length} meses, último ${ultimo.mes} = ${ultimo.valor} %`);
await anotar('euribor', true, `${serie.length} meses, último ${ultimo.mes}`);
