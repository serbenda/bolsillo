// Impuestos y consumos de referencia para pasar el PVPC a euros reales.
// Revisa estos valores cuando cambie la fiscalidad de la luz.

/**
 * Impuestos aplicados a la energía en la península y Baleares (contratos de hasta 10 kW).
 * El IVA puede bajar al 10 % y el impuesto eléctrico al 0,5 % algunos meses
 * si el IPC de la electricidad sube mucho; en ese caso, añade aquí el periodo.
 */
export const IMPUESTOS = [
  // desde: 'YYYY-MM-DD' (incluido). Se usa el último periodo que ya haya empezado.
  { desde: '2025-01-01', iee: 0.0511269632, iva: 0.21 },
];

export function impuestosEn(fecha) {
  return [...IMPUESTOS].reverse().find((p) => p.desde <= fecha) ?? IMPUESTOS[0];
}

/** Factor que convierte €/kWh sin impuestos en €/kWh con impuesto eléctrico e IVA. */
export function factorImpuestos(fecha) {
  const { iee, iva } = impuestosEn(fecha);
  return (1 + iee) * (1 + iva);
}

/**
 * Consumos típicos por uso (estimaciones orientativas para un hogar medio).
 * horas: duración del programa, para buscar el tramo más barato seguido.
 */
export const APARATOS = [
  { id: 'lavadora', nombre: 'Lavadora', detalle: 'un lavado a 40 °C', kwh: 0.9, horas: 2, pregunta: '¿Cuándo pongo la lavadora?', lo: 'la' },
  { id: 'lavavajillas', nombre: 'Lavavajillas', detalle: 'un programa normal', kwh: 1.1, horas: 2, pregunta: '¿Cuándo pongo el lavavajillas?', lo: 'lo' },
  { id: 'secadora', nombre: 'Secadora', detalle: 'una carga', kwh: 2.5, horas: 2, pregunta: '¿Cuándo pongo la secadora?', lo: 'la' },
  { id: 'horno', nombre: 'Horno', detalle: 'una hora a 200 °C', kwh: 1.2, horas: 1, pregunta: '¿Cuándo enciendo el horno?', lo: 'lo' },
  { id: 'coche', nombre: 'Coche eléctrico', detalle: 'carga para 100 km', kwh: 16, horas: 4, pregunta: '¿Cuándo cargo el coche?', lo: 'lo' },
];
