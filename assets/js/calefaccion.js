// Precios regulados de la calefacción: bombona de butano y tarifa de último recurso (TUR) del gas natural.
// No tienen API: salen en el BOE (el butano cada dos meses, la TUR cada trimestre) y se copian aquí a mano.
// scripts/revisar-calefaccion.mjs avisa (con un issue en GitHub) cuando un precio ha caducado.

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

/** Precios caducados a fecha `hoy` (YYYY-MM-DD): lista de avisos. */
export function caducados(hoy) {
  const avisos = [];
  if (hoy > BUTANO.hasta) avisos.push(`el butano (válido hasta ${BUTANO.hasta})`);
  if (hoy > TUR.hasta) avisos.push(`la TUR del gas (válida hasta ${TUR.hasta})`);
  return avisos;
}
