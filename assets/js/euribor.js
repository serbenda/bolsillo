// Euríbor a un año del Banco de España (API de series estadísticas) y cálculo de hipotecas.
// Este módulo lo usan tanto el navegador como el script de la GitHub Action.

export const SERIE_EURIBOR = 'D_1NBAF472';

export function urlEuribor(rango = 'MAX') {
  const p = new URLSearchParams({ idioma: 'es', series: SERIE_EURIBOR, rango });
  return `https://app.bde.es/bierest/resources/srdatosapp/listaSeries?${p}`;
}

/** Respuesta del BdE → [{ mes: 'YYYY-MM', valor: % }] de más antiguo a más reciente. */
export function parsearEuribor(json) {
  const serie = (Array.isArray(json) ? json : []).find((s) => s.serie === SERIE_EURIBOR) ?? json?.[0];
  const fechas = serie?.fechas ?? [];
  const valores = serie?.valores ?? [];
  const meses = new Map();
  fechas.forEach((f, i) => {
    const v = valores[i];
    if (typeof f !== 'string' || typeof v !== 'number' || !Number.isFinite(v)) return;
    meses.set(f.slice(0, 7), v);
  });
  return [...meses.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([mes, valor]) => ({ mes, valor }));
}

/**
 * Cuota mensual de un préstamo francés.
 * @param capital  capital pendiente (€)
 * @param meses    plazo restante en meses
 * @param tipo     tipo anual en % (Euríbor + diferencial); nunca por debajo de 0
 */
export function cuotaMensual(capital, meses, tipo) {
  if (!(capital > 0) || !(meses > 0)) return 0;
  const i = Math.max(tipo, 0) / 100 / 12;
  if (i === 0) return capital / meses;
  return (capital * i) / (1 - (1 + i) ** -meses);
}

/** Intereses del primer año con una cuota fija (para explicar a dónde va el dinero). */
export function interesesPrimerAno(capital, meses, tipo) {
  const i = Math.max(tipo, 0) / 100 / 12;
  const cuota = cuotaMensual(capital, meses, tipo);
  let pendiente = capital;
  let intereses = 0;
  for (let m = 0; m < Math.min(12, meses); m++) {
    const int = pendiente * i;
    intereses += int;
    pendiente -= cuota - int;
  }
  return intereses;
}

/** Busca el Euríbor de un mes concreto ('YYYY-MM'). */
export function euriborDe(serie, mes) {
  return serie.find((p) => p.mes === mes)?.valor ?? null;
}
