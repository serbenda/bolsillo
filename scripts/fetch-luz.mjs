// Descarga el PVPC de hoy y de mañana y lo guarda en data/luz.json.
// Lo ejecuta la GitHub Action antes de publicar la web.
// Si REE falla, no rompe el despliegue: la web intentará la API en directo.

import { writeFile, mkdir } from 'node:fs/promises';
import { fechaMadrid, descargarPvpc } from '../assets/js/ree.js';

const salida = new URL('../data/luz.json', import.meta.url);
const dias = {};

for (const desplazamiento of [0, 1]) {
  const fecha = fechaMadrid(desplazamiento);
  try {
    const horas = await descargarPvpc(fecha);
    if (horas.length >= 23) {
      dias[fecha] = horas;
      console.log(`${fecha}: ${horas.length} horas`);
    } else {
      console.log(`${fecha}: sin datos todavía (${horas.length} horas)`);
    }
  } catch (e) {
    console.warn(`${fecha}: ${e.message}`);
  }
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(
  salida,
  JSON.stringify({ actualizado: new Date().toISOString(), unidad: '€/kWh', dias }, null, 1) + '\n'
);
console.log(`Guardado ${Object.keys(dias).length} día(s) en data/luz.json`);
