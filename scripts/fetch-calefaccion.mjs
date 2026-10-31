// Descarga los precios regulados de la calefacción y los guarda en data/calefaccion.json:
// - Bombona de butano: tabla oficial del Ministerio para la Transición Ecológica (una fila por revisión).
// - Gas natural (TUR): API de datos abiertos del BOE. Se recorren los sumarios de los días que faltan por mirar,
//   se busca la resolución de la tarifa de último recurso y se leen sus precios.
// Si algo falla, se mantiene lo anterior; si un precio caduca sin que llegue el nuevo, se anota para abrir un issue.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { BUTANO, TUR, parsearButano, parsearTur, aplicar, caducados } from '../assets/js/calefaccion.js';
import { anotar } from './estado.mjs';

const salida = new URL('../data/calefaccion.json', import.meta.url);
const CABECERAS = { 'User-Agent': 'bolsillo (github.com/serbenda/bolsillo)' };
const URL_BUTANO = 'https://www.miteco.gob.es/es/energia/hidrocarburos-nuevos-combustibles/glp/precios/gases-licuados-del-petroleo-envasados.html';
const hoy = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(new Date());
const mas = (f, n) => new Date(Date.parse(`${f}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

let anterior = null;
try { anterior = JSON.parse(await readFile(salida, 'utf8')); } catch {}
aplicar(anterior); // parte de lo último bueno (o de los valores de respaldo del módulo)
const datos = {
  butano: { precio: BUTANO.precio, desde: BUTANO.desde, hasta: BUTANO.hasta, boe: BUTANO.boe, historia: BUTANO.historia },
  tur: { desde: TUR.desde, boe: TUR.boe, tarifas: TUR.tarifas },
  revisadoHasta: anterior?.revisadoHasta ?? mas(TUR.desde, -3),
};
const problemas = [];

// Butano
try {
  const r = await fetch(URL_BUTANO, { headers: CABECERAS });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const filas = parsearButano(await r.text());
  if (filas.length < 5) throw new Error(`solo ${filas.length} filas en la tabla`);
  const vigente = filas.filter((f) => f.desde <= hoy).at(-1) ?? filas.at(-1);
  datos.butano = {
    precio: vigente.precio,
    desde: vigente.desde,
    hasta: vigente.hasta,
    boe: URL_BUTANO,
    historia: filas.filter((f) => f.desde >= mas(hoy, -730) && f.desde <= hoy).map((f) => [f.desde, f.precio]),
  };
  console.log(`Butano: ${vigente.precio} € del ${vigente.desde} al ${vigente.hasta} (${filas.length} revisiones)`);
} catch (e) {
  problemas.push(`butano: ${e.message}`);
  console.warn(`Butano: se mantiene el precio anterior (${e.message})`);
}

// TUR del gas: sumarios del BOE desde el último día mirado (como mucho 45 días por vez)
try {
  let dia = mas(datos.revisadoHasta, 1);
  let mirados = 0;
  while (dia <= hoy && mirados < 45) {
    const r = await fetch(`https://www.boe.es/datosabiertos/api/boe/sumario/${dia.replace(/-/g, '')}`, { headers: { ...CABECERAS, Accept: 'application/json' } });
    mirados++;
    if (r.status === 404) { datos.revisadoHasta = dia; dia = mas(dia, 1); continue; } // sin BOE ese día (domingos)
    if (!r.ok) throw new Error(`sumario ${dia}: HTTP ${r.status}`);
    // El sumario es un JSON muy anidado: se recorren todas las disposiciones buscando la de la TUR
    const items = [];
    const recorrer = (o) => {
      if (Array.isArray(o)) o.forEach(recorrer);
      else if (o && typeof o === 'object') {
        if (typeof o.identificador === 'string' && typeof o.titulo === 'string') items.push(o);
        Object.values(o).forEach(recorrer);
      }
    };
    recorrer(await r.json());
    const tur = items.find((x) => /tarifa de último recurso de gas natural/i.test(x.titulo));
    if (tur) {
      const id = tur.identificador;
      const xml = await (await fetch(`https://www.boe.es/diario_boe/xml.php?id=${id}`, { headers: CABECERAS })).text();
      const tarifas = parsearTur(xml);
      if (!tarifas) throw new Error(`no se han podido leer los precios de ${id}`);
      datos.tur = { desde: dia, boe: `https://www.boe.es/diario_boe/txt.php?id=${id}`, tarifas };
      console.log(`TUR: nueva resolución ${id} del ${dia}`);
    }
    datos.revisadoHasta = dia;
    dia = mas(dia, 1);
  }
  console.log(`TUR: revisado el BOE hasta el ${datos.revisadoHasta} (${mirados} días mirados)`);
} catch (e) {
  problemas.push(`TUR: ${e.message}`);
  console.warn(`TUR: se mantiene la tarifa anterior (${e.message})`);
}

await mkdir(new URL('../data/', import.meta.url), { recursive: true });
await writeFile(salida, JSON.stringify({ actualizado: new Date().toISOString(), ...datos }));

aplicar(datos);
const avisos = caducados(hoy);
if (avisos.length) await anotar('calefaccion', false, `Caducado sin precio nuevo: ${avisos.join(' y ')}${problemas.length ? ` (${problemas.join('; ')})` : ''}`);
else if (problemas.length) await anotar('calefaccion', true, `precios vigentes; aviso: ${problemas.join('; ')}`);
else await anotar('calefaccion', true, `butano ${datos.butano.precio} € hasta ${datos.butano.hasta}; TUR desde ${datos.tur.desde}`);
