// Precios de carburantes del Ministerio para la Transición Ecológica.
// Este módulo lo usan tanto el navegador como el script de la GitHub Action.

export const URL_MINISTERIO =
  'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

/** Combustibles que mostramos: clave corta → campo de la API y nombre. */
export const COMBUSTIBLES = {
  g95: { campo: 'Precio Gasolina 95 E5', nombre: 'Gasolina 95' },
  g98: { campo: 'Precio Gasolina 98 E5', nombre: 'Gasolina 98' },
  diesel: { campo: 'Precio Gasoleo A', nombre: 'Diésel' },
  dieselPlus: { campo: 'Precio Gasoleo Premium', nombre: 'Diésel premium' },
  glp: { campo: 'Precio Gases licuados del petróleo', nombre: 'GLP (autogás)' },
};

/** Columnas del fichero compacto, en orden. */
export const COLUMNAS = ['id', 'rotulo', 'direccion', 'municipio', 'provincia', 'cp', 'lat', 'lon', 'horario', ...Object.keys(COMBUSTIBLES)];

/** "1,459" → 1.459; vacío o raro → null. */
export function numero(texto) {
  if (typeof texto !== 'string' || texto.trim() === '') return null;
  const n = Number(texto.trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/** "30/10/2026 21:10:33" → "2026-10-30T21:10:33" (hora peninsular). */
function fechaIso(texto) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}:\d{2}:\d{2})$/.exec(texto ?? '');
  return m ? `${m[3]}-${m[2]}-${m[1]}T${m[4]}` : null;
}

const MENORES = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'a', 'en']);
const titulo = (s) =>
  (s ?? '')
    .toLowerCase()
    .trim()
    .replace(/(^|[\s(/-])(\p{L}[\p{L}']*)/gu, (m, sep, palabra, pos) =>
      pos > 0 && MENORES.has(palabra) ? m : sep + palabra[0].toUpperCase() + palabra.slice(1)
    );

/**
 * Reduce la respuesta del Ministerio (~10 MB) a un fichero compacto:
 * solo venta al público, con coordenadas y al menos un precio.
 */
export function compactar(json) {
  const claves = Object.keys(COMBUSTIBLES);
  const estaciones = [];
  for (const e of json?.ListaEESSPrecio ?? []) {
    if (e['Tipo Venta'] && e['Tipo Venta'] !== 'P') continue;
    const lat = numero(e['Latitud']);
    const lon = numero(e['Longitud (WGS84)']);
    if (lat === null || lon === null) continue;
    const precios = claves.map((k) => numero(e[COMBUSTIBLES[k].campo]));
    if (precios.every((p) => p === null)) continue;
    estaciones.push([
      e['IDEESS'],
      (e['Rótulo'] ?? '').trim(),
      titulo(e['Dirección']),
      titulo(e['Municipio']),
      titulo(e['Provincia']),
      e['C.P.'] ?? '',
      Math.round(lat * 1e5) / 1e5,
      Math.round(lon * 1e5) / 1e5,
      e['Horario'] ?? '',
      ...precios,
    ]);
  }

  const medias = {};
  claves.forEach((k, i) => {
    const ps = estaciones.map((e) => e[9 + i]).filter((p) => p !== null);
    medias[k] = ps.length ? Math.round((ps.reduce((a, b) => a + b, 0) / ps.length) * 1000) / 1000 : null;
  });

  return { fecha: fechaIso(json?.Fecha), columnas: COLUMNAS, medias, estaciones };
}

/** Convierte las filas compactas en objetos. */
export function expandir(datos) {
  return datos.estaciones.map((fila) => Object.fromEntries(datos.columnas.map((c, i) => [c, fila[i]])));
}

/** Distancia en km entre dos puntos (fórmula del haverseno). */
export function distanciaKm(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

/** Estaciones con ese combustible dentro del radio, de más barata a más cara. */
export function cercanas(estaciones, { lat, lon }, radioKm, combustible) {
  return estaciones
    .filter((e) => e[combustible] !== null)
    .map((e) => ({ ...e, km: distanciaKm(lat, lon, e.lat, e.lon) }))
    .filter((e) => e.km <= radioKm)
    .sort((a, b) => a[combustible] - b[combustible] || a.km - b.km);
}

/** Centro aproximado de un código postal: media de sus gasolineras. */
export function centroCodigoPostal(estaciones, cp) {
  const limpio = String(cp).trim().padStart(5, '0');
  const del = estaciones.filter((e) => e.cp === limpio);
  if (!del.length) return null;
  return {
    lat: del.reduce((s, e) => s + e.lat, 0) / del.length,
    lon: del.reduce((s, e) => s + e.lon, 0) / del.length,
    municipio: del[0].municipio,
  };
}
