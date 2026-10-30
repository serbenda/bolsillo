// Carga los precios de la luz: primero el fichero que genera la Action,
// y si no tiene el día de hoy, la API de REE en directo.

import { fechaMadrid, horaMadrid, descargarPvpc } from './ree.js';

const FICHERO = new URL('../../data/luz.json', import.meta.url);

async function leerFichero() {
  try {
    const r = await fetch(FICHERO, { cache: 'no-cache' });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function enDirecto(fecha) {
  try {
    const horas = await descargarPvpc(fecha);
    return horas.length >= 23 ? horas : null;
  } catch {
    return null;
  }
}

const conFecha = (fecha, horas) => horas?.map((h) => ({ fecha, ...h })) ?? null;

/**
 * Devuelve { hoy, manana, fechaHoy, fechaManana, actualizado } donde hoy y manana
 * son listas [{ fecha, hora, precio }] o null si no hay datos.
 */
export async function cargarLuz() {
  const fechaHoy = fechaMadrid(0);
  const fechaManana = fechaMadrid(1);
  const fichero = await leerFichero();

  let hoy = fichero?.dias?.[fechaHoy] ?? null;
  let manana = fichero?.dias?.[fechaManana] ?? null;
  let actualizado = fichero?.actualizado ? new Date(fichero.actualizado) : null;

  if (!hoy) {
    hoy = await enDirecto(fechaHoy);
    if (hoy) actualizado = new Date();
  }
  // El precio de mañana se publica hacia las 20:15.
  if (!manana && horaMadrid() >= 20) manana = await enDirecto(fechaManana);

  return {
    fechaHoy,
    fechaManana,
    hoy: conFecha(fechaHoy, hoy),
    manana: conFecha(fechaManana, manana),
    actualizado,
  };
}

export const formatoPrecio = (p) =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(p);

export const horaTexto = (h) => `${String(h).padStart(2, '0')}:00`;
