// Precios regulados de la calefacción: bombona de butano y tarifa de último recurso (TUR) del gas natural.
// scripts/fetch-calefaccion.mjs los descarga solos (butano: tabla del Ministerio; TUR: API del BOE) y los guarda
// en data/calefaccion.json. Los valores de aquí son los de respaldo, por si esa descarga no ha funcionado nunca.
// Si un precio caduca sin que haya llegado el nuevo, la Action abre un issue.

/** Bombona de 12,5 kg, precio máximo con impuestos en la península y Baleares (MITECO / BOE). */
export const BUTANO = {
  precio: 18.84,
  desde: '2026-09-15',
  hasta: '2026-11-16',
  boe: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-19115',
  // Tope del Real Decreto-ley 25/2026 para la bombona de 12,5 kg en la península
  tope: { precio: 19.55, hasta: '2027-06-30', boe: 'https://www.boe.es/eli/es/rdl/2026/09/29/25' },
  historia: [
    ['2025-01-21', 16.64], ['2025-03-18', 17.67], ['2025-05-20', 18], ['2025-07-15', 17.11],
    ['2025-09-16', 16.27], ['2025-11-18', 15.46], ['2026-01-20', 15.58], ['2026-03-17', 16.35],
    ['2026-05-19', 15.39], ['2026-07-21', 17.83], ['2026-09-15', 18.84],
  ],
};

/** Tarifas de último recurso del gas natural, sin impuestos (BOE-A-2026-20389, desde el 1 de octubre de 2026). */
export const TUR = {
  desde: '2026-10-01',
  hasta: '2026-12-31', // se revisa cada trimestre
  boe: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20389',
  tarifas: [
    { id: 'TUR.1', hastaKwh: 5000, fijoMes: 3.83, variable: 0.0525259 },
    { id: 'TUR.2', hastaKwh: 15000, fijoMes: 8.17, variable: 0.05042762 },
    { id: 'TUR.3', hastaKwh: 50000, fijoMes: 19.32, variable: 0.04698799 },
  ],
};

/** Impuesto especial sobre hidrocarburos del gas natural para calefacción: 0,65 €/GJ = 0,00234 €/kWh. */
export const IMPUESTO_GAS = 0.00234;
export const IVA = 0.21;
/** Energía aproximada de una bombona de 12,5 kg (poder calorífico inferior del butano, unos 12,7 kWh/kg). */
export const KWH_BOMBONA = 12.5 * 12.7;

/** Tarifa TUR que corresponde a un consumo anual, o null si pasa de 50.000 kWh. */
export const tarifaPara = (kwh) => TUR.tarifas.find((t) => kwh <= t.hastaKwh) ?? null;

/** Coste anual con la TUR: { tarifa, sinImpuestos, conImpuestos } (sin alquiler del contador). */
export function costeGas(kwh) {
  const tarifa = tarifaPara(kwh);
  if (!tarifa || !(kwh > 0)) return null;
  const sinImpuestos = tarifa.fijoMes * 12 + kwh * tarifa.variable;
  return { tarifa, sinImpuestos, conImpuestos: (sinImpuestos + kwh * IMPUESTO_GAS) * (1 + IVA) };
}

/** Precio por kWh de calor: butano frente a gas natural (con impuestos, aproximado). */
export function precioKwh(kwhGas = 8000) {
  const gas = costeGas(kwhGas);
  return { butano: BUTANO.precio / KWH_BOMBONA, gas: gas ? gas.conImpuestos / kwhGas : null };
}

/** Último día del trimestre de una fecha (la TUR se revisa cada trimestre). */
export function finTrimestre(fecha) {
  const [a, m] = fecha.split('-').map(Number);
  const mesFin = Math.ceil(m / 3) * 3;
  return new Date(Date.UTC(a, mesFin, 0)).toISOString().slice(0, 10);
}

/** Pone los precios descargados (data/calefaccion.json) en lugar de los de respaldo. */
export function aplicar(datos) {
  if (datos?.butano?.precio > 0) Object.assign(BUTANO, { ...datos.butano, tope: BUTANO.tope });
  if (datos?.tur?.tarifas?.length >= 3) Object.assign(TUR, datos.tur, { hasta: finTrimestre(datos.tur.desde) });
}

/** Precios caducados a fecha `hoy` (YYYY-MM-DD): lista de avisos. Unos días de margen para que salga el BOE nuevo. */
export function caducados(hoy, margenDias = 3) {
  const mas = (f) => new Date(Date.parse(`${f}T12:00:00Z`) + margenDias * 86400000).toISOString().slice(0, 10);
  const avisos = [];
  if (hoy > mas(BUTANO.hasta)) avisos.push(`el butano (válido hasta ${BUTANO.hasta})`);
  if (hoy > mas(TUR.hasta)) avisos.push(`la TUR del gas (válida hasta ${TUR.hasta})`);
  return avisos;
}

/* ---------- Lectura de las fuentes (la usa scripts/fetch-calefaccion.mjs) ---------- */

const isoDe = (dmy) => { const [d, m, a] = dmy.split('/'); return `${a}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; };
const numeroEs = (s) => Number(String(s).replace(/\./g, '').replace(',', '.'));

/**
 * Tabla del Ministerio con el precio de la bombona en cada revisión → [{ desde, hasta, precio }] de más antigua a más reciente.
 * La página trae el HTML escapado dentro de un JSON, así que primero se deshace el escape.
 */
export function parsearButano(html) {
  const t = String(html)
    .replace(/\\r\\n/g, ' ').replace(/\\"/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#34;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
  const filas = [];
  for (const [, fila] of t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const c = [...fila.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((x) => x[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim());
    if (c.length === 4 && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(c[1]) && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(c[2]) && /^\d+([.,]\d+)?$/.test(c[3])) {
      filas.push({ desde: isoDe(c[1]), hasta: isoDe(c[2]), precio: numeroEs(c[3]) });
    }
  }
  return filas.filter((f) => f.precio > 5 && f.precio < 60).sort((a, b) => a.desde.localeCompare(b.desde));
}

/** Resolución de la TUR del gas (XML del BOE) → tarifas TUR.1 a TUR.3 en €/mes y €/kWh, o null. */
export function parsearTur(xml) {
  const tarifas = [];
  for (const [, fila] of String(xml).matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)) {
    const c = [...fila.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((x) => x[1].replace(/<[^>]+>/g, '').trim());
    const id = c[0]?.match(/^TUR\.([1-3])$/)?.[1];
    if (id && c.length >= 4) {
      const fijoMes = numeroEs(c[2]);
      const variable = Number((numeroEs(c[3]) / 100).toFixed(8)); // cent/kWh → €/kWh
      if (fijoMes > 0 && variable > 0 && variable < 1 && !tarifas.some((t) => t.id === `TUR.${id}`)) tarifas.push({ id: `TUR.${id}`, hastaKwh: [5000, 15000, 50000][id - 1], fijoMes, variable });
    }
  }
  return tarifas.length === 3 ? tarifas : null;
}
