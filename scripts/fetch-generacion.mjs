// Descarga la generación eléctrica diaria por tecnología y el precio medio del PVPC
// de los últimos 30 días, y lo guarda en data/generacion.json.
// Si REE falla, se mantienen los datos de la publicación anterior.

import { writeFile, mkdir } from 'node:fs/promises';
import { fechaMadrid } from '../assets/js/ree.js';
import { urlGeneracion, urlPreciosRango, parsearGeneracion, preciosDiarios, combinar } from '../assets/js/generacion.js';
import { anotar } from './estado.mjs';

const salida = new URL('../data/generacion.json', import.meta.url);
const desde = fechaMadrid(-30);
const hasta = fechaMadrid(0);

async function json(url) {
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn(`Intento ${intento}: ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 4000 * intento));
    }
  }
  return null;
}

const [gen, precios] = await Promise.all([json(urlGeneracion(desde, hasta)), json(urlPreciosRango(desde, hasta))]);
const dias = combinar(parsearGeneracion(gen), preciosDiarios(precios));

if (dias.length < 20) {
  await anotar('generacion', false, `REE devolvió ${dias.length} días de generación`);
  console.warn('Generación: se mantienen los datos anteriores');
  process.exit(0);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(salida, JSON.stringify({ actualizado: new Date().toISOString(), dias }));
const ultimo = dias.at(-1);
console.log(`Generación: ${dias.length} días, último ${ultimo.fecha} con ${Math.round(ultimo.renovable * 100)} % renovable`);
await anotar('generacion', true, `${dias.length} días`);
