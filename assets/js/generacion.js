// Generación eléctrica por tecnología (REE) y su relación con el precio de la luz.
// Este módulo lo usan tanto el navegador como el script de la GitHub Action.

const BASE = 'https://apidatos.ree.es/es/datos';

/** Tecnologías agrupadas como las entiende cualquiera. */
export const GRUPOS = {
  solar: { nombre: 'Solar', renovable: true, tipos: ['Solar fotovoltaica', 'Solar térmica'] },
  eolica: { nombre: 'Eólica', renovable: true, tipos: ['Eólica'] },
  hidraulica: { nombre: 'Hidráulica', renovable: true, tipos: ['Hidráulica'] },
  otrasRenovables: { nombre: 'Otras renovables', renovable: true, tipos: ['Otras renovables', 'Residuos renovables'] },
  nuclear: { nombre: 'Nuclear', renovable: false, tipos: ['Nuclear'] },
  gas: { nombre: 'Gas', renovable: false, tipos: ['Ciclo combinado', 'Turbina de gas', 'Cogeneración'] },
  otras: { nombre: 'Carbón y otras', renovable: false, tipos: ['Carbón', 'Turbina de vapor', 'Motores diésel', 'Residuos no renovables', 'Fuel + Gas'] },
};

export function urlGeneracion(desde, hasta) {
  const p = new URLSearchParams({
    start_date: `${desde}T00:00`,
    end_date: `${hasta}T23:59`,
    time_trunc: 'day',
    geo_trunc: 'electric_system',
    geo_limit: 'peninsular',
    geo_ids: '8741',
  });
  return `${BASE}/generacion/estructura-generacion?${p}`;
}

export function urlPreciosRango(desde, hasta) {
  const p = new URLSearchParams({ start_date: `${desde}T00:00`, end_date: `${hasta}T23:59`, time_trunc: 'hour', geo_ids: '8741' });
  return `${BASE}/mercados/precios-mercados-tiempo-real?${p}`;
}

/** Generación diaria → { 'YYYY-MM-DD': { total, grupos: { solar: MWh, … } } } */
export function parsearGeneracion(json) {
  const grupoDe = {};
  for (const [clave, g] of Object.entries(GRUPOS)) for (const t of g.tipos) grupoDe[t] = clave;
  const dias = {};
  for (const serie of json?.included ?? []) {
    const tipo = serie.type ?? serie.attributes?.title;
    for (const v of serie.attributes?.values ?? []) {
      if (typeof v.value !== 'number' || typeof v.datetime !== 'string') continue;
      const fecha = v.datetime.slice(0, 10);
      const dia = (dias[fecha] ??= { total: 0, grupos: {} });
      if (tipo === 'Generación total') dia.total = v.value;
      else if (grupoDe[tipo]) dia.grupos[grupoDe[tipo]] = (dia.grupos[grupoDe[tipo]] ?? 0) + v.value;
    }
  }
  for (const dia of Object.values(dias)) {
    if (!dia.total) dia.total = Object.values(dia.grupos).reduce((a, b) => a + b, 0);
  }
  return dias;
}

/** Precios horarios del PVPC de un rango → { 'YYYY-MM-DD': media en €/kWh } */
export function preciosDiarios(json) {
  const serie = (json?.included ?? []).find((s) => s.id === '1001' || /pvpc/i.test(s.type ?? ''));
  const acc = {};
  for (const v of serie?.attributes?.values ?? []) {
    if (typeof v.value !== 'number' || typeof v.datetime !== 'string') continue;
    const f = v.datetime.slice(0, 10);
    (acc[f] ??= []).push(v.value);
  }
  return Object.fromEntries(
    Object.entries(acc).map(([f, vs]) => [f, Math.round((vs.reduce((a, b) => a + b, 0) / vs.length / 1000) * 100000) / 100000])
  );
}

/** Une generación y precio en una lista ordenada por fecha con el % renovable de cada día. */
export function combinar(generacion, precios) {
  return Object.entries(generacion)
    .filter(([, d]) => d.total > 0)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([fecha, d]) => {
      const renovable = Object.entries(d.grupos)
        .filter(([g]) => GRUPOS[g]?.renovable)
        .reduce((s, [, v]) => s + v, 0);
      const reparto = Object.fromEntries(
        Object.keys(GRUPOS).map((g) => [g, Math.round(((d.grupos[g] ?? 0) / d.total) * 1000) / 1000])
      );
      return { fecha, renovable: Math.round((renovable / d.total) * 1000) / 1000, reparto, precio: precios[fecha] ?? null };
    });
}

/**
 * Compara el precio medio de los días con más renovables con el de los días con menos
 * (partiendo por la mediana). Devuelve null si no hay datos suficientes.
 */
export function efectoRenovables(dias) {
  const conPrecio = dias.filter((d) => d.precio !== null);
  if (conPrecio.length < 6) return null;
  const orden = [...conPrecio].sort((a, b) => a.renovable - b.renovable);
  const mitad = Math.floor(orden.length / 2);
  const pocas = orden.slice(0, mitad);
  const muchas = orden.slice(orden.length - mitad);
  const media = (xs, k) => xs.reduce((s, x) => s + x[k], 0) / xs.length;
  return {
    dias: conPrecio.length,
    muchas: { renovable: media(muchas, 'renovable'), precio: media(muchas, 'precio') },
    pocas: { renovable: media(pocas, 'renovable'), precio: media(pocas, 'precio') },
  };
}
