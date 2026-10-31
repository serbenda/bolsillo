// Página «¿Cuánto cuesta la calefacción?»: bombona de butano y TUR del gas natural.

import { BUTANO, TUR, costeGas, precioKwh, KWH_BOMBONA } from './calefaccion.js';
import { graficoLineas } from './grafico-lineas.js';
import { tr, euros, numero, porcentaje, formato } from './idioma.js';

const $ = (id) => document.getElementById(id);
const FORMATO_DIA = formato({ day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const dia = (f) => FORMATO_DIA.format(new Date(`${f}T12:00:00Z`));
const diaCorto = (f) => formato({ day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${f}T12:00:00Z`));
const entero = (s) => Number(String(s).replace(/[\s.,]/g, ''));
const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.calefaccion.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.calefaccion.${k}`); } catch { return null; } };
const hoy = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(new Date());

function pintarButano() {
  const anterior = BUTANO.historia.at(-2)?.[1];
  const caducado = hoy > BUTANO.hasta;
  $('titular').textContent = caducado
    ? tr(`La bombona de butano costaba ${euros(BUTANO.precio)} hasta el ${diaCorto(BUTANO.hasta)}.`, `A butane cylinder cost ${euros(BUTANO.precio)} until ${diaCorto(BUTANO.hasta)}.`)
    : tr(`La bombona de butano cuesta ${euros(BUTANO.precio)} hasta el ${diaCorto(BUTANO.hasta)}.`, `A butane cylinder costs ${euros(BUTANO.precio)} until ${diaCorto(BUTANO.hasta)}.`);
  $('entradilla').textContent = tr(
    `Precio máximo con impuestos de la bombona de 12,5 kg en la península y Baleares. El Gobierno ha puesto un tope de ${euros(BUTANO.tope.precio)} hasta el ${dia(BUTANO.tope.hasta)}.`,
    `Maximum price including taxes for the 12.5 kg cylinder in mainland Spain and the Balearic Islands. The government has capped it at ${euros(BUTANO.tope.precio)} until ${dia(BUTANO.tope.hasta)}.`
  );
  if (anterior) {
    const v = BUTANO.precio / anterior - 1;
    $('butano-frase').textContent = Math.abs(v) < 0.0005
      ? tr('Igual que en la revisión anterior.', 'Same as at the previous review.')
      : tr(`${v > 0 ? 'Sube' : 'Baja'} un ${porcentaje(Math.abs(v) * 100, 1)} respecto a la revisión anterior (${euros(anterior)}).`, `${v > 0 ? 'Up' : 'Down'} ${porcentaje(Math.abs(v) * 100, 1)} on the previous review (${euros(anterior)}).`);
  }
  $('butano-detalle').textContent = caducado
    ? tr('Ya debería haber un precio nuevo: lo actualizaremos en cuanto lo recojamos del BOE.', 'A new price should be out by now: we will update it as soon as we pick it up from the BOE.')
    : tr(`Vale desde el ${dia(BUTANO.desde)}. El precio se revisa cada dos meses; la próxima revisión es el ${dia(sumarDia(BUTANO.hasta))}.`, `Valid from ${dia(BUTANO.desde)}. The price is reviewed every two months; the next review is on ${dia(sumarDia(BUTANO.hasta))}.`);
}

function sumarDia(f) {
  const d = new Date(`${f}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function pintarHistoria() {
  const puntos = BUTANO.historia.map(([f, v]) => ({ mes: f.slice(0, 7), valor: v }));
  graficoLineas($('historia'), [{ clase: 'producto-sel', puntos }], { paso: 1 });
  const max = BUTANO.historia.reduce((a, b) => (b[1] > a[1] ? b : a));
  const min = BUTANO.historia.reduce((a, b) => (b[1] < a[1] ? b : a));
  const texto = tr(
    `Precio de la bombona en cada revisión, en euros. Desde el ${dia(BUTANO.historia[0][0])}, el más alto: ${euros(max[1])} (${dia(max[0])}); el más bajo: ${euros(min[1])} (${dia(min[0])}).`,
    `Cylinder price at each review, in euros. Since ${dia(BUTANO.historia[0][0])}, highest: ${euros(max[1])} (${dia(max[0])}); lowest: ${euros(min[1])} (${dia(min[0])}).`
  );
  $('pie-historia').textContent = texto;
  $('historia').setAttribute('aria-label', texto);
}

function calcularGas() {
  const kwh = entero($('kwh').value);
  const c = costeGas(kwh);
  if (!c) {
    $('resultado').textContent = kwh > 50000
      ? tr('La tarifa regulada es para consumos de hasta 50.000 kWh al año.', 'The regulated tariff is for up to 50,000 kWh a year.')
      : tr('Escribe tu consumo anual, por ejemplo 8.000.', 'Enter your yearly use, for example 8,000.');
    $('resultado-detalle').textContent = '';
    return;
  }
  guardar('kwh', $('kwh').value);
  $('resultado').textContent = tr(
    `Con la ${c.tarifa.id} pagarías unos ${euros(c.conImpuestos, 0)} al año: ${euros(c.conImpuestos / 12, 0)} al mes de media.`,
    `On ${c.tarifa.id} you'd pay about ${euros(c.conImpuestos, 0)} a year: ${euros(c.conImpuestos / 12, 0)} a month on average.`
  );
  $('resultado-detalle').textContent = tr(
    `${euros(c.sinImpuestos, 0)} sin impuestos, más el impuesto sobre hidrocarburos y el IVA del 21 %. Sin el alquiler del contador. Precios desde el ${dia(TUR.desde)}.`,
    `${euros(c.sinImpuestos, 0)} before tax, plus hydrocarbons duty and 21% VAT. Excludes meter rental. Prices from ${dia(TUR.desde)}.`
  );
  // En invierno se gasta mucho más: equivalente en bombonas
  const p = precioKwh(kwh);
  const bombonas = kwh / KWH_BOMBONA;
  $('comparar-frase').textContent = p.gas < p.butano
    ? tr(`Con gas natural, el kWh de calor sale a ${numero(p.gas * 100, 1)} céntimos; con butano, a ${numero(p.butano * 100, 1)}.`, `With natural gas, a kWh of heat costs ${numero(p.gas * 100, 1)} cents; with butane, ${numero(p.butano * 100, 1)}.`)
    : tr(`Con butano, el kWh de calor sale a ${numero(p.butano * 100, 1)} céntimos; con gas natural, a ${numero(p.gas * 100, 1)}.`, `With butane, a kWh of heat costs ${numero(p.butano * 100, 1)} cents; with natural gas, ${numero(p.gas * 100, 1)}.`);
  $('comparar-detalle').textContent = tr(
    `Para ${numero(kwh, 0)} kWh al año harían falta unas ${numero(Math.round(bombonas), 0)} bombonas (${euros(bombonas * BUTANO.precio, 0)}), frente a ${euros(c.conImpuestos, 0)} con la tarifa regulada del gas. Es aproximado: depende del rendimiento de cada aparato.`,
    `${numero(kwh, 0)} kWh a year would take about ${numero(Math.round(bombonas), 0)} cylinders (${euros(bombonas * BUTANO.precio, 0)}), compared with ${euros(c.conImpuestos, 0)} on the regulated gas tariff. It's approximate: it depends on each appliance's efficiency.`
  );
  $('tarifas').querySelectorAll('.producto').forEach((li) => li.classList.toggle('tuya', li.dataset.id === c.tarifa.id));
}

function pintarTarifas() {
  const max = Math.max(...TUR.tarifas.map((t) => t.variable));
  $('tarifas').innerHTML = TUR.tarifas.map((t, i) => {
    const desde = i === 0 ? 0 : TUR.tarifas[i - 1].hastaKwh;
    const rango = i === 0 ? tr(`hasta ${numero(t.hastaKwh, 0)} kWh`, `up to ${numero(t.hastaKwh, 0)} kWh`) : tr(`${numero(desde, 0)}–${numero(t.hastaKwh, 0)} kWh`, `${numero(desde, 0)}–${numero(t.hastaKwh, 0)} kWh`);
    return `<li class="producto" data-id="${t.id}">
        <span class="nombre">${t.id} <small>(${rango})</small></span>
        <span class="eje-barra coste" aria-hidden="true"><span class="barra-var" style="width:${((t.variable / max) * 100).toFixed(1)}%"></span></span>
        <span class="cifra">${numero(t.variable * 100, 2)} c/kWh</span>
      </li>`;
  }).join('');
  $('nota-tarifas').textContent = tr(
    `Término variable sin impuestos de cada tarifa, según tu consumo anual. Término fijo: ${TUR.tarifas.map((t) => `${t.id}, ${euros(t.fijoMes)} al mes`).join('; ')}.`,
    `Energy price before tax for each tariff, by yearly use. Fixed charge: ${TUR.tarifas.map((t) => `${t.id}, ${euros(t.fijoMes)} a month`).join('; ')}.`
  );
}

pintarButano();
pintarTarifas();
const k = leer('kwh');
$('kwh').value = k ?? numero(8000, 0);
document.querySelectorAll('input[name=uso]').forEach((i) => {
  if (k && entero(k) === Number(i.value)) i.checked = true;
  i.addEventListener('change', () => { $('kwh').value = numero(Number(i.value), 0); calcularGas(); });
});
$('kwh').addEventListener('input', calcularGas);
$('formulario').addEventListener('submit', (e) => e.preventDefault());
$('actualizado').textContent = tr(`Butano: precio del ${dia(BUTANO.desde)}. Gas: tarifa del ${dia(TUR.desde)}.`, `Butane: price from ${dia(BUTANO.desde)}. Gas: tariff from ${dia(TUR.desde)}.`);
calcularGas();
let espera;
new ResizeObserver(() => { clearTimeout(espera); espera = setTimeout(pintarHistoria, 100); }).observe($('historia'));
