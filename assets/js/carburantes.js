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
export const COLUMNAS = ['id', 'rotulo', 'direccion', 'municipio', 'provincia', 'cp', 'lat', 'lon', 'horario', ...Object.keys(COMBUSTIBLES), 'prov'];

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

/** Algunas gasolineras sin marca tienen como rótulo su número de registro ("Nº 10.935"). */
const rotulo = (s) => {
  const r = (s ?? '').trim();
  return /^n[º°o.]?\s*[\d.]+$/i.test(r) ? '' : r;
};

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
      rotulo(e['Rótulo']),
      titulo(e['Dirección']),
      titulo(e['Municipio']),
      titulo(e['Provincia']),
      e['C.P.'] ?? '',
      Math.round(lat * 1e5) / 1e5,
      Math.round(lon * 1e5) / 1e5,
      e['Horario'] ?? '',
      ...precios,
      String(e['IDProvincia'] ?? '').padStart(2, '0'),
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

/**
 * Parte el fichero compacto por provincias para que el móvil solo descargue lo que necesita.
 * Devuelve { indice, provincias } donde indice lleva fecha, medias y la caja de cada provincia.
 */
export function porProvincias(datos) {
  const iProv = datos.columnas.indexOf('prov');
  const iLat = datos.columnas.indexOf('lat');
  const iLon = datos.columnas.indexOf('lon');
  const iNombre = datos.columnas.indexOf('provincia');
  const provincias = {};
  const cajas = {};
  for (const fila of datos.estaciones) {
    const id = fila[iProv] || '00';
    (provincias[id] ??= { fecha: datos.fecha, columnas: datos.columnas, estaciones: [] }).estaciones.push(fila);
    const c = (cajas[id] ??= { nombre: fila[iNombre], n: 0, caja: [90, 180, -90, -180] });
    c.n++;
    c.caja = [Math.min(c.caja[0], fila[iLat]), Math.min(c.caja[1], fila[iLon]), Math.max(c.caja[2], fila[iLat]), Math.max(c.caja[3], fila[iLon])];
  }
  return { indice: { fecha: datos.fecha, medias: datos.medias, provincias: cajas }, provincias };
}

/** Distancia (km) desde un punto al rectángulo [latMin, lonMin, latMax, lonMax]; 0 si está dentro. */
function distanciaACaja({ lat, lon }, [a, b, c, d]) {
  return distanciaKm(lat, lon, Math.min(Math.max(lat, a), c), Math.min(Math.max(lon, b), d));
}

/** Provincias cuyo territorio (aprox.) queda a menos de radioKm del centro. */
export function provinciasCercanas(indice, centro, radioKm) {
  return Object.entries(indice.provincias)
    .filter(([, p]) => distanciaACaja(centro, p.caja) <= radioKm)
    .map(([id]) => id);
}

/* ---------- Horarios ---------- */

const DIAS = 'LMXJVSD'; // lunes = 0 … domingo = 6

function diasDe(texto) {
  const dias = new Set();
  for (const parte of texto.split(',')) {
    const [a, b] = parte.trim().split('-').map((d) => DIAS.indexOf(d.trim().toUpperCase()));
    if (a < 0) return null;
    if (b === undefined) dias.add(a);
    else if (b < 0) return null;
    else for (let d = a; ; d = (d + 1) % 7) { dias.add(d); if (d === b) break; }
  }
  return dias;
}

const minutos = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/**
 * ¿Está abierta? Interpreta horarios como "L-V: 07:00-22:00; S-D: 08:00-14:00", "L-D: 24H"
 * o "L-S: 07:00-14:00 y 16:00-21:00". Devuelve true, false o null si no se entiende.
 * @param ahora { dia: 0 (lunes)…6, min: minutos desde las 00:00 } en hora local de la gasolinera
 */
export function abierta(horario, ahora) {
  if (typeof horario !== 'string' || !horario.trim()) return null;
  let entendido = false;
  for (const bloque of horario.split(';')) {
    const m = /^\s*([LMXJVSD][LMXJVSD,\s-]*):\s*(.+)$/i.exec(bloque);
    if (!m) return null;
    const dias = diasDe(m[1]);
    if (!dias) return null;
    entendido = true;
    const horas = m[2].trim();
    if (/^24\s*H$/i.test(horas)) { if (dias.has(ahora.dia)) return true; continue; }
    for (const tramo of horas.split(/\s+y\s+|,/)) {
      const t = /(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/.exec(tramo);
      if (!t) return null;
      const ini = minutos(t[1]);
      const fin = minutos(t[2]);
      if (fin > ini) {
        if (dias.has(ahora.dia) && ahora.min >= ini && ahora.min < fin) return true;
      } else {
        // Pasa de medianoche (p. ej. 22:00-06:00) o 00:00-00:00 = todo el día
        const ayer = (ahora.dia + 6) % 7;
        if (dias.has(ahora.dia) && ahora.min >= ini) return true;
        if (dias.has(ayer) && ahora.min < fin) return true;
      }
    }
  }
  return entendido ? false : null;
}

/** Día y minuto actuales en Madrid (Canarias va una hora menos; el margen es aceptable). */
export function ahoraEnEspana(fecha = new Date()) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(fecha).map((p) => [p.type, p.value])
  );
  const dia = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(partes.weekday);
  return { dia, min: Number(partes.hour) * 60 + Number(partes.minute) };
}

/* ---------- Códigos postales ---------- */

/**
 * Lee el fichero de códigos postales de GeoNames (ES.txt, separado por tabuladores) y lo agrupa
 * por provincia (dos primeras cifras): { '28': { '28100': [lat, lon, 'Alcobendas'] } }.
 * Si un código tiene varios lugares, se queda con la media de sus coordenadas y el primer nombre.
 */
export function codigosPostales(tsv) {
  const acumulado = new Map();
  for (const linea of tsv.split('\n')) {
    const c = linea.split('\t');
    if (c.length < 11 || c[0] !== 'ES') continue;
    const cp = c[1].trim();
    const lat = Number(c[9]);
    const lon = Number(c[10]);
    if (!/^\d{5}$/.test(cp) || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const a = acumulado.get(cp) ?? { lat: 0, lon: 0, n: 0, lugar: c[2].trim() };
    a.lat += lat; a.lon += lon; a.n++;
    acumulado.set(cp, a);
  }
  const salida = {};
  for (const [cp, a] of acumulado) {
    (salida[cp.slice(0, 2)] ??= {})[cp] = [Math.round((a.lat / a.n) * 1e4) / 1e4, Math.round((a.lon / a.n) * 1e4) / 1e4, a.lugar];
  }
  return salida;
}
