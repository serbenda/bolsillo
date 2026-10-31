// Letras del Tesoro y bonos del Estado (Banco de España): cuánto rinde el dinero.
// Este módulo lo usan tanto el navegador como el script de la GitHub Action.

/** Tipo de interés de cada subasta de Letras (mercado primario) y rentabilidad del bono a 10 años. */
export const PLAZOS = [
  { id: 'm3', serie: 'D_DTED0C0G', meses: 3, dias: 91 },
  { id: 'm6', serie: 'D_DTED0E0G', meses: 6, dias: 182 },
  { id: 'm9', serie: 'D_DTED0I0G', meses: 9, dias: 273 },
  { id: 'm12', serie: 'D_DTED0G0G', meses: 12, dias: 364 },
];
export const BONO10 = { id: 'b10', serie: 'D_G0B1F0ZP' };

/** Retención/tributación del ahorro en el IRPF para los primeros 6.000 € de rendimientos. */
export const IRPF_AHORRO = 0.19;

export const urlSerieBde = (serie, rango = '36M') =>
  `https://app.bde.es/bierest/resources/srdatosapp/listaSeries?${new URLSearchParams({ idioma: 'es', series: serie, rango })}`;

/** Respuesta del BdE (datos diarios) → [{ fecha: 'YYYY-MM-DD', valor: % }] de más antigua a más reciente. */
export function parsearBde(json) {
  const s = Array.isArray(json) ? json[0] : null;
  const fechas = s?.fechas ?? [];
  const valores = s?.valores ?? [];
  const porFecha = new Map();
  fechas.forEach((f, i) => {
    const v = valores[i];
    if (typeof f === 'string' && typeof v === 'number' && Number.isFinite(v)) porFecha.set(f.slice(0, 10), v);
  });
  return [...porFecha.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([fecha, valor]) => ({ fecha, valor }));
}

/**
 * Lo que ganas con una Letra: los intereses se calculan sobre el dinero invertido
 * con el tipo de la subasta y los días del plazo (base 360, como el Tesoro).
 * Devuelve { bruto, neto } en euros.
 */
export function ganancia(cantidad, tipo, dias) {
  if (!(cantidad > 0) || !(dias > 0)) return { bruto: 0, neto: 0 };
  const bruto = cantidad * (tipo / 100) * (dias / 360);
  return { bruto, neto: bruto > 0 ? bruto * (1 - IRPF_AHORRO) : bruto };
}

/** Lo que pierde de poder de compra un dinero parado durante `meses` con una inflación anual `inflacion` (0,03 = 3 %). */
export function perdidaInflacion(cantidad, inflacion, meses) {
  if (!(cantidad > 0)) return 0;
  return cantidad - cantidad / (1 + inflacion) ** (meses / 12);
}
