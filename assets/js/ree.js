// Acceso a la API de Red Eléctrica (REData) para el precio PVPC.
// Este módulo lo usan tanto el navegador como el script de la GitHub Action.

export const ZONA = 'Europe/Madrid';
const BASE = 'https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real';
const GEO_PENINSULA = 8741;

/** Fecha YYYY-MM-DD en hora de Madrid, con desplazamiento opcional en días. */
export function fechaMadrid(desplazamientoDias = 0, base = new Date()) {
  const d = new Date(base.getTime() + desplazamientoDias * 86400000);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: ZONA }).format(d);
}

/** Hora actual (0-23) en Madrid. */
export function horaMadrid(base = new Date()) {
  const h = new Intl.DateTimeFormat('es-ES', { timeZone: ZONA, hour: '2-digit', hourCycle: 'h23' }).format(base);
  return Number(h);
}

export function urlPvpc(fecha) {
  const p = new URLSearchParams({
    start_date: `${fecha}T00:00`,
    end_date: `${fecha}T23:59`,
    time_trunc: 'hour',
    geo_ids: String(GEO_PENINSULA),
  });
  return `${BASE}?${p}`;
}

/**
 * Convierte la respuesta de REE en [{ hora: 0..23, precio: €/kWh }].
 * Agrupa por hora local (la API puede devolver tramos de 15 minutos y,
 * en el cambio de hora, dos valores para la misma hora) y hace la media.
 */
export function parsearPvpc(json) {
  const serie = (json?.included ?? []).find(
    (s) => s.id === '1001' || /pvpc/i.test(s.type ?? '') || /pvpc/i.test(s.attributes?.title ?? '')
  );
  const valores = serie?.attributes?.values ?? [];
  const porHora = new Map();
  for (const v of valores) {
    if (typeof v.value !== 'number' || typeof v.datetime !== 'string') continue;
    const hora = Number(v.datetime.slice(11, 13)); // la fecha ya viene en hora peninsular
    const acc = porHora.get(hora) ?? { suma: 0, n: 0 };
    acc.suma += v.value;
    acc.n += 1;
    porHora.set(hora, acc);
  }
  return [...porHora.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([hora, { suma, n }]) => ({ hora, precio: Math.round((suma / n) / 1000 * 100000) / 100000 }));
}

export async function descargarPvpc(fecha, fetchFn = fetch) {
  const r = await fetchFn(urlPvpc(fecha), { headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(`REE respondió ${r.status} para ${fecha}`);
  return parsearPvpc(await r.json());
}
