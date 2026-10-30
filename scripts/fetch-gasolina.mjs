// Descarga los precios de todas las gasolineras y guarda data/gasolina.json compacto.
// Lo ejecuta la GitHub Action antes de publicar la web.
// Si el Ministerio falla, no rompe el despliegue: la sección mostrará un aviso.

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { URL_MINISTERIO, compactar } from '../assets/js/carburantes.js';

const salida = new URL('../data/gasolina.json', import.meta.url);

async function descargar() {
  // Permite pasar un fichero ya descargado: node scripts/fetch-gasolina.mjs fichero.json
  if (process.argv[2]) return JSON.parse(await readFile(process.argv[2], 'utf8'));
  for (let intento = 1; intento <= 3; intento++) {
    try {
      const r = await fetch(URL_MINISTERIO, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      console.warn(`Intento ${intento}: ${e.cause?.code ?? ''} ${e.message}`);
      await new Promise((ok) => setTimeout(ok, 5000 * intento));
    }
  }
  return null;
}

const json = await descargar();
if (!json) {
  console.warn('Sin datos de carburantes: se publica la web sin data/gasolina.json');
  process.exit(0);
}

const datos = compactar(json);
await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(salida, JSON.stringify(datos));
console.log(`${datos.estaciones.length} gasolineras (${datos.fecha}). Medias:`, datos.medias);
