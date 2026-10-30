// Índice de Precios de Consumo (IPC) del INE: serie y cálculos.
// Este módulo lo usan tanto el navegador como el script de la GitHub Action.

/** Índice general nacional (base 2025), mensual desde enero de 2002. */
export const SERIE_IPC = 'IPC290751';

export function urlIpc() {
  return `https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/${SERIE_IPC}?nult=1000`;
}

/** Respuesta del INE → [{ mes: 'YYYY-MM', valor }] de más antiguo a más reciente. */
export function parsearIpc(json) {
  const datos = json?.Data ?? [];
  const meses = new Map();
  for (const d of datos) {
    if (typeof d.Valor !== 'number' || !Number.isFinite(d.Valor) || d.Secreto) continue;
    if (!(d.FK_Periodo >= 1 && d.FK_Periodo <= 12)) continue;
    meses.set(`${d.Anyo}-${String(d.FK_Periodo).padStart(2, '0')}`, d.Valor);
  }
  return [...meses.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([mes, valor]) => ({ mes, valor }));
}

const valorDe = (serie, mes) => serie.find((p) => p.mes === mes)?.valor ?? null;

/** Euros de `desde` equivalentes en `hasta`: { cantidad, subida } o null. */
export function equivalencia(serie, cantidad, desde, hasta) {
  const a = valorDe(serie, desde);
  const b = valorDe(serie, hasta);
  if (a === null || b === null || !(cantidad >= 0)) return null;
  return { cantidad: (cantidad * b) / a, subida: b / a - 1 };
}

/** Inflación interanual de cada mes (variación frente al mismo mes del año anterior). */
export function interanual(serie) {
  const porMes = new Map(serie.map((p) => [p.mes, p.valor]));
  return serie
    .map((p) => {
      const anterior = porMes.get(`${Number(p.mes.slice(0, 4)) - 1}${p.mes.slice(4)}`);
      return anterior ? { mes: p.mes, tasa: p.valor / anterior - 1 } : null;
    })
    .filter(Boolean);
}
