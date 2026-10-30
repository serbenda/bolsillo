// Convierte el listado de códigos postales de GeoNames (ES.txt) en data/cp/<provincia>.json.
// La Action descarga y descomprime https://download.geonames.org/export/zip/ES.zip antes.
// Uso: node scripts/fetch-cp.mjs /ruta/a/ES.txt
// Datos de GeoNames, licencia CC BY 4.0.

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { codigosPostales } from '../assets/js/carburantes.js';
import { anotar } from './estado.mjs';

const carpeta = new URL('../data/cp/', import.meta.url);

let tsv = '';
try {
  tsv = await readFile(process.argv[2], 'utf8');
} catch (e) {
  console.warn(`Sin fichero de códigos postales: ${e.message}`);
}

const grupos = codigosPostales(tsv);
const total = Object.values(grupos).reduce((n, g) => n + Object.keys(g).length, 0);
if (total < 5000) {
  await anotar('cp', false, `GeoNames: solo ${total} códigos postales`);
  console.warn('Códigos postales: se publica sin ellos (la web usará las gasolineras como referencia)');
  process.exit(0);
}

await mkdir(carpeta, { recursive: true });
for (const [prov, cps] of Object.entries(grupos)) {
  await writeFile(new URL(`${prov}.json`, carpeta), JSON.stringify(cps));
}
await anotar('cp', true, `${total} códigos postales`);
console.log(`${total} códigos postales en ${Object.keys(grupos).length} provincias`);
