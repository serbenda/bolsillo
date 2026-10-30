// Descarga los precios de todas las gasolineras y los guarda:
//   data/gasolina.json             fichero completo compacto (sirve de copia para la siguiente publicación)
//   data/gasolina/indice.json      fecha, medias y caja de cada provincia
//   data/gasolina/<provincia>.json gasolineras de cada provincia (lo que descarga la web)
// Si el Ministerio falla, se reparten los datos de la publicación anterior y se avisa.

import { writeFile, mkdir, readFile, rm } from 'node:fs/promises';
import { URL_MINISTERIO, compactar, porProvincias } from '../assets/js/carburantes.js';
import { anotar } from './estado.mjs';

const completo = new URL('../data/gasolina.json', import.meta.url);
const carpeta = new URL('../data/gasolina/', import.meta.url);

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

let datos = null;
const json = await descargar();
if (json) {
  datos = compactar(json);
  const ok = datos.estaciones.length >= Number(process.env.GASOLINERAS_MINIMO ?? 5000);
  await anotar('gasolina', ok, `${datos.estaciones.length} gasolineras, precios del ${datos.fecha}`);
  if (!ok) datos = null;
} else {
  await anotar('gasolina', false, 'No se pudo descargar del Ministerio');
}

if (!datos) {
  try {
    datos = JSON.parse(await readFile(completo, 'utf8'));
    if (!datos.columnas?.includes('prov')) throw new Error('formato antiguo');
    console.warn(`Se usan los datos anteriores (${datos.fecha})`);
  } catch (e) {
    console.warn(`Sin datos de carburantes que publicar: ${e.message}`);
    process.exit(0);
  }
}

const { indice, provincias } = porProvincias(datos);
await rm(carpeta, { recursive: true, force: true });
await mkdir(carpeta, { recursive: true });
await writeFile(completo, JSON.stringify(datos));
await writeFile(new URL('indice.json', carpeta), JSON.stringify(indice));
for (const [id, p] of Object.entries(provincias)) {
  await writeFile(new URL(`${id}.json`, carpeta), JSON.stringify(p));
}
console.log(`${datos.estaciones.length} gasolineras en ${Object.keys(provincias).length} provincias (${datos.fecha}). Medias:`, datos.medias);
