// Página «¿Cuánto rinden mis ahorros?»: Letras del Tesoro frente a la inflación.

import { PLAZOS, ganancia, perdidaInflacion, IRPF_AHORRO } from './ahorro.js';
import { interanual } from './ipc.js';
import { graficoLineas } from './grafico-lineas.js';
import { tr, euros, porcentaje, formato, numero } from './idioma.js';

const $ = (id) => document.getElementById(id);
const DATOS = new URL('../../data/', import.meta.url);
const FORMATO_DIA = formato({ day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const dia = (f) => FORMATO_DIA.format(new Date(`${f}T12:00:00Z`));
const FORMATO_MES = formato({ month: 'long', year: 'numeric', timeZone: 'UTC' });
const nombreMes = (mes) => FORMATO_MES.format(new Date(`${mes}-01T00:00:00Z`));
const decimal = (s) => {
  const t = String(s).replace(/\s/g, '');
  const ultimo = Math.max(t.lastIndexOf(','), t.lastIndexOf('.'));
  if (ultimo < 0) return Number(t);
  const dec = t.slice(ultimo + 1);
  if (dec.length === 3 && !/[.,]/.test(t.slice(0, ultimo))) return Number(t.replace(/[.,]/g, ''));
  return Number(`${t.slice(0, ultimo).replace(/[.,]/g, '')}.${dec}`);
};
const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.ahorro.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.ahorro.${k}`); } catch { return null; } };
const nombrePlazo = (p) => tr(`${p.meses} meses`, `${p.meses} months`);

let letras = {};
let bono = null;
let inflacion = null; // { mes, tasa }

function avisar(texto) {
  $('mensaje').textContent = texto ?? '';
  $('mensaje').hidden = !texto;
}

const ultima = (id) => letras[id]?.at(-1);

function calcular() {
  const cantidad = decimal($('cantidad').value);
  const id = document.querySelector('input[name=plazo]:checked').value;
  const plazo = PLAZOS.find((p) => p.id === id);
  const u = ultima(id);
  if (!(cantidad > 0) || !u) {
    $('resultado').textContent = tr('Escribe una cantidad mayor que cero, por ejemplo 10.000.', 'Enter an amount above zero, for example 10,000.');
    $('resultado-detalle').textContent = '';
    return;
  }
  guardar('cantidad', $('cantidad').value);
  guardar('plazo', id);
  const g = ganancia(cantidad, u.valor, plazo.dias);
  $('resultado').textContent = tr(
    `En ${nombrePlazo(plazo)} ganarías ${euros(g.bruto)}: unos ${euros(g.neto)} después de Hacienda.`,
    `In ${nombrePlazo(plazo)} you'd earn ${euros(g.bruto)}: about ${euros(g.neto)} after tax.`
  );
  let detalle = tr(
    `Con el ${porcentaje(u.valor, 3)} de la subasta del ${dia(u.fecha)} y un ${porcentaje(IRPF_AHORRO * 100, 0)} de IRPF.`,
    `Using the ${porcentaje(u.valor, 3)} from the ${dia(u.fecha)} auction and ${porcentaje(IRPF_AHORRO * 100, 0)} income tax.`
  );
  if (inflacion) {
    const perdida = perdidaInflacion(cantidad, inflacion.tasa, plazo.meses);
    detalle += perdida > 0
      ? tr(
          ` Si lo dejas en una cuenta sin intereses, con la inflación actual (${porcentaje(inflacion.tasa * 100, 1)}) perderías unos ${euros(perdida, 0)} de poder de compra en ese tiempo.`,
          ` Left in an account with no interest, at current inflation (${porcentaje(inflacion.tasa * 100, 1)}) you'd lose about ${euros(perdida, 0)} of buying power over that time.`
        )
      : '';
  }
  $('resultado-detalle').textContent = detalle;
}

function pintarPlazos() {
  const filas = PLAZOS.map((p) => ({ p, u: ultima(p.id) })).filter((x) => x.u);
  const maximo = Math.max(...filas.map((x) => x.u.valor), bono?.at(-1)?.valor ?? 0, 0.01);
  const fila = (nombre, valor, extra = '') => `<li class="producto${extra}">
        <span class="nombre">${nombre}</span>
        <span class="eje-barra coste" aria-hidden="true"><span class="barra-var" style="width:${((valor / maximo) * 100).toFixed(1)}%"></span></span>
        <span class="cifra">${porcentaje(valor, 3)}</span>
      </li>`;
  $('plazos').innerHTML = filas.map(({ p, u }) => fila(`${tr('Letras a', 'Bills,')} ${nombrePlazo(p)}`, u.valor)).join('') +
    (bono?.length ? fila(tr('Bono a 10 años (referencia)', '10-year bond (for reference)'), bono.at(-1).valor, ' referencia') : '');
  $('nota-plazos').textContent = tr(
    `Tipo de la última subasta: ${filas.map(({ p, u }) => `${nombrePlazo(p)}, ${dia(u.fecha)}`).join('; ')}.${bono?.length ? ` El bono a 10 años es la rentabilidad del mercado el ${dia(bono.at(-1).fecha)}.` : ''}`,
    `Rate at the latest auction: ${filas.map(({ p, u }) => `${nombrePlazo(p)}, ${dia(u.fecha)}`).join('; ')}.${bono?.length ? ` The 10-year bond is the market yield on ${dia(bono.at(-1).fecha)}.` : ''}`
  );
}

function pintarHistoria(ipc) {
  // Una subasta al mes: se agrupa por mes para compararla con la inflación
  const porMes = new Map(letras.m12.map((x) => [x.fecha.slice(0, 7), x.valor]));
  const puntos = [...porMes].map(([mes, valor]) => ({ mes, valor }));
  const desde = puntos[0].mes;
  graficoLineas($('historia'), [
    { clase: 'producto-sel', puntos },
    { clase: 'general', puntos: ipc.filter((p) => p.mes >= desde) },
  ], { paso: 1 });
  const u = puntos.at(-1);
  const texto = tr(
    `Interés anual en %. Última subasta a 12 meses, ${nombreMes(u.mes)}: ${porcentaje(u.valor, 3)}${inflacion ? `; inflación de ${nombreMes(inflacion.mes)}: ${porcentaje(inflacion.tasa * 100, 1)}` : ''}.`,
    `Annual rate in %. Latest 12-month auction, ${nombreMes(u.mes)}: ${porcentaje(u.valor, 3)}${inflacion ? `; inflation for ${nombreMes(inflacion.mes)}: ${porcentaje(inflacion.tasa * 100, 1)}` : ''}.`
  );
  $('pie-historia').textContent = texto;
  $('historia').setAttribute('aria-label', texto);
}

async function iniciar() {
  let ipc = [];
  try {
    const [a, b] = await Promise.all([fetch(new URL('ahorro.json', DATOS)), fetch(new URL('ipc.json', DATOS))]);
    if (!a.ok) throw new Error(a.status);
    const j = await a.json();
    letras = j.letras ?? {};
    bono = j.bono10 ?? null;
    if (b.ok) {
      const t = interanual((await b.json()).serie ?? []);
      ipc = t.map((x) => ({ mes: x.mes, valor: x.tasa * 100 }));
      inflacion = t.at(-1) ?? null;
    }
    if (!letras.m12?.length) throw new Error('vacío');
  } catch {
    $('titular').textContent = tr('¿Cuánto rinden mis ahorros?', 'How much do my savings earn?');
    avisar(tr('Los datos de las Letras no están disponibles ahora mismo. Vuelve a intentarlo en un rato.', "Treasury bill data isn't available right now. Please try again shortly."));
    $('formulario').querySelectorAll('input').forEach((el) => (el.disabled = true));
    $('bloque-historia').hidden = true;
    return;
  }

  const u = ultima('m12');
  $('titular').textContent = tr(
    `Las Letras del Tesoro a 12 meses pagan un ${porcentaje(u.valor, 2)}.`,
    `12-month Spanish Treasury bills pay ${porcentaje(u.valor, 2)}.`
  );
  if (inflacion) {
    const real = (1 + u.valor / 100) / (1 + inflacion.tasa) - 1;
    $('entradilla').textContent = real >= 0
      ? tr(
          `Subasta del ${dia(u.fecha)}. Con la inflación al ${porcentaje(inflacion.tasa * 100, 1)}, tu dinero gana un ${porcentaje(real * 100, 1)} de poder de compra al año (antes de impuestos).`,
          `Auction on ${dia(u.fecha)}. With inflation at ${porcentaje(inflacion.tasa * 100, 1)}, your money gains ${porcentaje(real * 100, 1)} of buying power a year (before tax).`
        )
      : tr(
          `Subasta del ${dia(u.fecha)}. La inflación está más alta (${porcentaje(inflacion.tasa * 100, 1)}): aun así, pierdes mucho menos que con el dinero parado.`,
          `Auction on ${dia(u.fecha)}. Inflation is higher (${porcentaje(inflacion.tasa * 100, 1)}): even so, you lose much less than with money sitting idle.`
        );
  }

  const c = leer('cantidad');
  $('cantidad').value = c ?? numero(10000, 0); // con el separador de miles del idioma
  const p = leer('plazo'); const op = p && document.querySelector(`input[name=plazo][value="${p}"]`); if (op) op.checked = true;
  // Plazos sin datos: se desactivan
  document.querySelectorAll('input[name=plazo]').forEach((i) => {
    if (!ultima(i.value)) i.disabled = true;
    i.addEventListener('change', calcular);
  });
  $('cantidad').addEventListener('input', calcular);
  $('formulario').addEventListener('submit', (e) => e.preventDefault());
  $('actualizado').textContent = tr(`Última subasta: ${dia(u.fecha)}.`, `Latest auction: ${dia(u.fecha)}.`);
  calcular();
  pintarPlazos();

  let espera;
  new ResizeObserver(() => { clearTimeout(espera); espera = setTimeout(() => pintarHistoria(ipc), 100); }).observe($('historia'));
}

iniciar();
