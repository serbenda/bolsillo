// Sección «¿Por qué está cara o barata?» de la página de la luz.

import { GRUPOS, efectoRenovables } from './generacion.js';
import { fechaMadrid } from './ree.js';

const $ = (id) => document.getElementById(id);
const FICHERO = new URL('../../data/generacion.json', import.meta.url);
const pct = (x) => `${Math.round(x * 100)}\u00a0%`;
const precio = (x) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(x);
const FORMATO_CORTO = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const fechaCorta = (f) => FORMATO_CORTO.format(new Date(`${f}T12:00:00Z`));

/** Lista en castellano: «solar, eólica y nuclear». */
const enumerar = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} y ${xs.at(-1)}`);

function cuandoEs(fecha) {
  if (fecha === fechaMadrid(0)) return 'Hoy, hasta ahora,';
  if (fecha === fechaMadrid(-1)) return 'Ayer,';
  return `El ${fechaCorta(fecha)},`;
}

function pintarMezcla(dia) {
  const grupos = Object.entries(dia.reparto).filter(([, v]) => v > 0.005).sort((a, b) => b[1] - a[1]);
  $('mezcla').innerHTML = grupos
    .map(([g, v]) => `<span class="seg ${g}" style="flex-basis:${(v * 100).toFixed(1)}%" title="${GRUPOS[g].nombre}: ${pct(v)}"></span>`)
    .join('');
  $('mezcla-leyenda').innerHTML = grupos
    .map(([g, v]) => `<li><i class="seg ${g}"></i>${GRUPOS[g].nombre} <strong>${pct(v)}</strong></li>`)
    .join('');

  const nombres = (filtro, minimo) =>
    grupos.filter(([g, v]) => filtro(GRUPOS[g]) && v >= minimo).slice(0, 3).map(([g]) => GRUPOS[g].nombre.toLowerCase());
  const renovables = nombres((g) => g.renovable, 0.08);
  const resto = nombres((g) => !g.renovable, 0.12);
  let frase = `${cuandoEs(dia.fecha)} el ${pct(dia.renovable)} de la electricidad ha sido renovable`;
  if (dia.renovable >= 0.5 && renovables.length) frase += `, sobre todo ${enumerar(renovables)}.`;
  else if (resto.length) frase += `; el resto ha salido sobre todo de ${enumerar(resto)}.`;
  else frase += '.';
  $('gen-frase').textContent = `${frase} Cuanta más renovable, más barata suele salir la luz.`;
}

function pintarEfecto(dias) {
  const e = efectoRenovables(dias);
  if (!e) return;
  $('efecto-dias').textContent = e.dias;
  $('efecto-muchas').textContent = `${precio(e.muchas.precio)} €/kWh`;
  $('efecto-muchas-txt').textContent = `los días con más renovables (${pct(e.muchas.renovable)} de media)`;
  $('efecto-pocas').textContent = `${precio(e.pocas.precio)} €/kWh`;
  $('efecto-pocas-txt').textContent = `los días con menos (${pct(e.pocas.renovable)} de media)`;
  $('efecto').hidden = false;
}

function pintarDias(dias) {
  const conPrecio = dias.filter((d) => d.precio !== null);
  const max = Math.max(...conPrecio.map((d) => d.precio));
  const orden = [...conPrecio].map((d) => d.renovable).sort((a, b) => a - b);
  const t1 = orden[Math.floor(orden.length / 3)];
  const t2 = orden[Math.floor((orden.length * 2) / 3)];
  const g = $('grafico-dias');
  g.style.setProperty('--n', conPrecio.length);
  g.innerHTML = conPrecio
    .map((d, i) => {
      // Al revés que en el precio: mucha renovable es lo bueno (verde)
      const clase = d.renovable >= t2 ? 'barata' : d.renovable >= t1 ? 'media' : 'cara';
      const etiqueta = i % 5 === 0 || i === conPrecio.length - 1 ? fechaCorta(d.fecha) : '';
      return `<div class="barra ${clase}" style="--alto:${((d.precio / max) * 100).toFixed(1)}%;--i:${i}" title="${fechaCorta(d.fecha)}: ${precio(d.precio)} €/kWh, ${pct(d.renovable)} renovable"><span>${etiqueta}</span></div>`;
    })
    .join('');
  const barato = conPrecio.reduce((a, b) => (b.precio < a.precio ? b : a));
  const caro = conPrecio.reduce((a, b) => (b.precio > a.precio ? b : a));
  g.setAttribute(
    'aria-label',
    `Precio medio diario de la luz en los últimos ${conPrecio.length} días. El más barato, el ${fechaCorta(barato.fecha)}: ${precio(barato.precio)} €/kWh con un ${pct(barato.renovable)} de renovables. El más caro, el ${fechaCorta(caro.fecha)}: ${precio(caro.precio)} €/kWh con un ${pct(caro.renovable)}.`
  );
  requestAnimationFrame(() => g.classList.add('listo'));
}

try {
  const r = await fetch(FICHERO, { cache: 'no-cache' });
  if (!r.ok) throw new Error(r.status);
  const { dias } = await r.json();
  if (dias?.length) {
    pintarMezcla(dias.at(-1));
    pintarEfecto(dias);
    pintarDias(dias);
    $('bloque-porque').hidden = false;
  }
} catch {
  // Sin datos de generación la página sigue funcionando sin esta sección
}
