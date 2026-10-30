// Cálculos sobre una lista de horas con precio: [{ fecha, hora, precio }].

/** Media de precios de una lista. */
export function media(horas) {
  return horas.reduce((s, h) => s + h.precio, 0) / horas.length;
}

function consecutivas(a, b) {
  if (a.fecha === b.fecha) return b.hora === a.hora + 1;
  return a.hora === 23 && b.hora === 0;
}

/**
 * Busca el tramo de `duracion` horas seguidas con el precio medio más bajo.
 * Devuelve { inicio, horas, media } o null si no hay tramo posible.
 */
export function mejorTramo(horas, duracion) {
  let mejor = null;
  for (let i = 0; i + duracion <= horas.length; i++) {
    const tramo = horas.slice(i, i + duracion);
    let seguido = true;
    for (let j = 1; j < tramo.length; j++) {
      if (!consecutivas(tramo[j - 1], tramo[j])) { seguido = false; break; }
    }
    if (!seguido) continue;
    const m = media(tramo);
    if (!mejor || m < mejor.media - 1e-9) mejor = { inicio: tramo[0], horas: tramo, media: m };
  }
  return mejor;
}

/** Clasifica cada precio del día en 'barata', 'media' o 'cara' por terciles. */
export function clasificar(horas) {
  const orden = [...horas].map((h) => h.precio).sort((a, b) => a - b);
  const t1 = orden[Math.floor(orden.length / 3)];
  const t2 = orden[Math.floor((orden.length * 2) / 3)];
  return horas.map((h) => (h.precio < t1 ? 'barata' : h.precio < t2 ? 'media' : 'cara'));
}
