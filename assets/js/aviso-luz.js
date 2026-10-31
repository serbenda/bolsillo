// Texto del aviso «la luz de mañana». Es un script clásico (sin import/export) porque lo carga
// el service worker con importScripts; los tests lo cargan con node:vm.

self.avisoLuz = function avisoLuz(datos, fecha, idioma) {
  const horas = datos?.dias?.[fecha];
  if (!Array.isArray(horas) || horas.length < 23) return null;
  const orden = [...horas].sort((a, b) => a.precio - b.precio);
  const barata = orden[0].hora;
  const cara = orden.at(-1).hora;
  const tramo = (h) => (idioma === 'en'
    ? `${String(h).padStart(2, '0')}:00 to ${String((h + 1) % 24).padStart(2, '0')}:00`
    : `de ${h} a ${(h + 1) % 24} h`);
  return idioma === 'en'
    ? { titulo: 'Electricity tomorrow', cuerpo: `Cheapest from ${tramo(barata)}; most expensive from ${tramo(cara)}.` }
    : { titulo: 'La luz de mañana', cuerpo: `Más barata ${tramo(barata)}; más cara ${tramo(cara)}.` };
};
