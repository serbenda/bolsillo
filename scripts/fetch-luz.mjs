// Descarga el PVPC de hoy y de mañana y lo guarda en data/luz.json.
// Lo ejecuta la GitHub Action antes de publicar la web.
// Si REE falla, no rompe el despliegue: la web intentará la API en directo.

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { fechaMadrid, horaMadrid, descargarPvpc } from '../assets/js/ree.js';
import { anotar } from './estado.mjs';

const salida = new URL('../data/luz.json', import.meta.url);
const dias = {};
const errores = [];

// Datos de la publicación anterior (la Action los recupera antes), por si REE falla ahora.
let anteriores = {};
try {
  anteriores = JSON.parse(await readFile(salida, 'utf8')).dias ?? {};
} catch {}

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
    errores.push(`${fecha}: ${e.message}`);
  }
  if (!dias[fecha] && anteriores[fecha]) {
    dias[fecha] = anteriores[fecha];
    console.log(`${fecha}: se mantienen los datos de la publicación anterior`);
  }
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(
  salida,
  JSON.stringify({ actualizado: new Date().toISOString(), unidad: '€/kWh', dias }, null, 1) + '\n'
);
console.log(`Guardado ${Object.keys(dias).length} día(s) en data/luz.json`);

// Fallo si falta hoy, o si falta mañana cuando ya debería estar publicado (desde las 21:00).
const hoy = Boolean(dias[fechaMadrid(0)]);
const manana = Boolean(dias[fechaMadrid(1)]);
const ok = !errores.length && hoy && (manana || horaMadrid() < 21);
await anotar(
  'luz',
  ok,
  ok
    ? `${Object.keys(dias).length} día(s)`
    : [`hoy: ${hoy ? 'sí' : 'no'}, mañana: ${manana ? 'sí' : 'no'}`, ...errores].join('; ')
);
