// Idioma de la página (castellano o inglés) y formatos de números y fechas.
// Lo decide el atributo lang del <html>: las páginas de /en/ llevan lang="en".

export const idioma = (globalThis.document?.documentElement.lang ?? 'es').toLowerCase().startsWith('en') ? 'en' : 'es';
export const LOCALE = idioma === 'en' ? 'en-GB' : 'es-ES';

/** Elige el texto según el idioma: tr('Hoy', 'Today'). */
export const tr = (es, en) => (idioma === 'en' ? en : es);

/** Número con decimales fijos: 0,255 / 0.255 */
export const numero = (n, dec = 2, opciones = {}) =>
  new Intl.NumberFormat(LOCALE, { minimumFractionDigits: dec, maximumFractionDigits: dec, ...opciones }).format(n);

/** Euros: 1.234,56 € / €1,234.56 */
export const euros = (n, dec = 2) =>
  new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'EUR', minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: 'always' }).format(n);

/** Porcentaje a partir de un número ya en %: 2,7 % / 2.7% */
export const porcentaje = (n, dec = 1, minimo = dec) => {
  const texto = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: minimo, maximumFractionDigits: dec }).format(n);
  return idioma === 'en' ? `${texto}%` : `${texto} %`;
};

/** Fecha con formato reutilizable (crear el formateador una sola vez es mucho más rápido). */
export const formato = (opciones) => new Intl.DateTimeFormat(LOCALE, opciones);
