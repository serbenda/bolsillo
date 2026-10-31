// Índice de Referencia de Arrendamientos de Vivienda (IRAV) del INE: cuánto puede subir un alquiler.
// Este módulo lo usan tanto el navegador como el script de la GitHub Action.

import { mesesAntes } from './compra.js';

/** Variación anual del IRAV, total nacional, mensual desde noviembre de 2024 (en %). */
export const SERIE_IRAV = 'IRAV1';
export const urlIrav = () => `https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/${SERIE_IRAV}?nult=600`;

/**
 * Qué dato del índice vale para una actualización en `mes` (YYYY-MM): el último publicado
 * antes de ese mes, que es el de dos meses antes (el INE publica cada dato a mediados del mes siguiente).
 * Si aún no se ha publicado, se usa el último que hay y se marca como estimado.
 * Devuelve { mes, tasa (0,025 = 2,5 %), estimado } o null.
 */
export function indiceAplicable(serie, mes) {
  if (!serie?.length) return null;
  const buscado = mesesAntes(mes, 2);
  const exacto = serie.find((p) => p.mes === buscado);
  if (exacto) return { mes: exacto.mes, tasa: Number((exacto.valor / 100).toFixed(6)), estimado: false };
  const ultimo = serie.at(-1);
  if (buscado > ultimo.mes) return { mes: ultimo.mes, tasa: Number((ultimo.valor / 100).toFixed(6)), estimado: true };
  return null; // antes de que existiera el índice
}

/** Renta nueva con una subida máxima `tasa`: { nueva, subida }. Nunca baja por un índice negativo. */
export function rentaActualizada(renta, tasa) {
  const subida = renta * Math.max(tasa, 0);
  return { nueva: renta + subida, subida };
}
