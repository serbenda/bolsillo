// Precios de la compra: IPC por producto («rúbricas») del INE, base 2025.
// Este módulo lo usan tanto el navegador como el script de la GitHub Action.

/** Total de la compra: subgrupo «Alimentos» del IPC. */
export const ALIMENTOS = { id: 'alimentos', cod: 'IPC290811', es: 'Alimentos', en: 'Food' };

/** Productos que se muestran (rúbricas del IPC con nombres de andar por casa). */
export const PRODUCTOS = [
  { id: 'pan', cod: 'IPC292219', es: 'Pan', en: 'Bread' },
  { id: 'cereales', cod: 'IPC292215', es: 'Arroz, pasta y cereales', en: 'Rice, pasta and cereals' },
  { id: 'vacuno', cod: 'IPC292223', es: 'Carne de ternera', en: 'Beef' },
  { id: 'cerdo', cod: 'IPC292231', es: 'Carne de cerdo', en: 'Pork' },
  { id: 'pollo', cod: 'IPC292235', es: 'Pollo y aves', en: 'Chicken and poultry' },
  { id: 'pescado', cod: 'IPC292363', es: 'Pescado', en: 'Fish' },
  { id: 'marisco', cod: 'IPC292367', es: 'Marisco y conservas de pescado', en: 'Seafood and tinned fish' },
  { id: 'huevos', cod: 'IPC292243', es: 'Huevos', en: 'Eggs' },
  { id: 'leche', cod: 'IPC292247', es: 'Leche', en: 'Milk' },
  { id: 'lacteos', cod: 'IPC292251', es: 'Queso, yogures y lácteos', en: 'Cheese, yoghurt and dairy' },
  { id: 'aceite', cod: 'IPC292255', es: 'Aceite y grasas', en: 'Oil and fats' },
  { id: 'fruta', cod: 'IPC292259', es: 'Fruta fresca', en: 'Fresh fruit' },
  { id: 'frutossecos', cod: 'IPC292371', es: 'Frutos secos y fruta en conserva', en: 'Nuts and tinned fruit' },
  { id: 'verdura', cod: 'IPC292263', es: 'Verdura y legumbres frescas', en: 'Fresh vegetables and pulses' },
  { id: 'patatas', cod: 'IPC292375', es: 'Patatas', en: 'Potatoes' },
  { id: 'azucar', cod: 'IPC292271', es: 'Azúcar', en: 'Sugar' },
  { id: 'cafe', cod: 'IPC292275', es: 'Café, cacao e infusiones', en: 'Coffee, cocoa and tea' },
  { id: 'bebidas', cod: 'IPC292279', es: 'Agua, refrescos y zumos', en: 'Water, soft drinks and juice' },
  { id: 'alcohol', cod: 'IPC292383', es: 'Vino, cerveza y otras bebidas alcohólicas', en: 'Wine, beer and other alcohol' },
  { id: 'hogar', cod: 'IPC292323', es: 'Limpieza y droguería', en: 'Cleaning and household products' },
];

export const urlSerie = (cod, meses = 300) => `https://servicios.ine.es/wstempus/js/ES/DATOS_SERIE/${cod}?nult=${meses}`;

/** Mes (YYYY-MM) que queda `n` meses antes de `mes`. */
export function mesesAntes(mes, n) {
  const [a, m] = mes.split('-').map(Number);
  const total = a * 12 + (m - 1) - n;
  return `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, '0')}`;
}

/**
 * Variación de precio en los últimos `meses` meses de una serie [{ mes, valor }]:
 * { desde, hasta, variacion } (0,05 = +5 %) o null si faltan datos.
 */
export function variacion(serie, meses) {
  const ultimo = serie?.at(-1);
  if (!ultimo) return null;
  const desde = mesesAntes(ultimo.mes, meses);
  const antes = serie.find((p) => p.mes === desde);
  if (!antes || !(antes.valor > 0)) return null;
  return { desde, hasta: ultimo.mes, variacion: ultimo.valor / antes.valor - 1 };
}

/** Productos ordenados de lo que más sube a lo que más baja en el periodo. */
export function ranking(productos, meses) {
  return productos
    .map((p) => ({ ...p, ...variacion(p.serie, meses) }))
    .filter((p) => typeof p.variacion === 'number')
    .sort((a, b) => b.variacion - a.variacion);
}

/** Cuánto cuesta hoy una compra que hace `meses` meses costaba `gasto` euros. */
export function compraHoy(serieAlimentos, gasto, meses) {
  const v = variacion(serieAlimentos, meses);
  return v ? { ...v, gasto, hoy: gasto * (1 + v.variacion) } : null;
}

/**
 * Variación de cada año natural, de diciembre a diciembre: [{ anyo, variacion, hasta, parcial }].
 * El año en curso va del diciembre anterior al último mes publicado (parcial: true).
 */
export function anual(serie) {
  const valor = new Map((serie ?? []).map((p) => [p.mes, p.valor]));
  const ultimo = serie?.at(-1)?.mes;
  if (!ultimo) return [];
  const salida = [];
  const primero = Number(serie[0].mes.slice(0, 4));
  for (let anyo = primero + 1; anyo <= Number(ultimo.slice(0, 4)); anyo++) {
    const antes = valor.get(`${anyo - 1}-12`);
    const hasta = `${anyo}-12` <= ultimo ? `${anyo}-12` : ultimo;
    const despues = valor.get(hasta);
    if (antes > 0 && despues > 0) salida.push({ anyo, variacion: despues / antes - 1, hasta, parcial: hasta !== `${anyo}-12` });
  }
  return salida;
}

/**
 * Lo que costaba cada año la compra que hoy cuesta `gastoHoy` euros:
 * [{ anyo, mes, coste }], con el dato de diciembre de cada año y el último mes para el año en curso.
 */
export function costeAnual(serie, gastoHoy) {
  const ultimo = serie?.at(-1);
  if (!ultimo || !(ultimo.valor > 0)) return [];
  const porAnyo = new Map();
  for (const p of serie) if (p.valor > 0) porAnyo.set(p.mes.slice(0, 4), p); // se queda con el último mes de cada año
  return [...porAnyo.values()]
    .filter((p) => p.mes.endsWith('-12') || p.mes === ultimo.mes)
    .map((p) => ({ anyo: Number(p.mes.slice(0, 4)), mes: p.mes, coste: (gastoHoy * p.valor) / ultimo.valor }));
}
