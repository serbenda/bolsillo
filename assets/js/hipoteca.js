import { cuotaMensual, interesesPrimerAno, euriborDe, amortizar } from './euribor.js';

const $ = (id) => document.getElementById(id);
const FICHERO = new URL('../../data/euribor.json', import.meta.url);

const euros = (n, dec = 0) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: 'always' }).format(n);
const pct = (n) => `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(n)}\u00a0%`;
const nombreMes = (mes) =>
  new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${mes}-01T00:00:00Z`));

const guardar = (k, v) => { try { localStorage.setItem(`bolsillo.hipoteca.${k}`, v); } catch {} };
const leer = (k) => { try { return localStorage.getItem(`bolsillo.hipoteca.${k}`); } catch { return null; } };

// "150.000" → 150000 ; "0,75" → 0.75
const entero = (s) => Number(String(s).replace(/[^\d]/g, ''));
const decimal = (s) => Number(String(s).trim().replace(/\./g, '').replace(',', '.'));

let serie = [];

function avisar(texto) {
  $('mensaje').textContent = texto ?? '';
  $('mensaje').hidden = !texto;
}

function leerFormulario() {
  return {
    capital: entero($('capital').value),
    meses: entero($('anos').value) * 12,
    diferencial: decimal($('diferencial').value),
    revision: $('revision').value,
  };
}

function calcular() {
  const { capital, meses, diferencial, revision } = leerFormulario();
  const ultimo = serie.at(-1);
  const antes = euriborDe(serie, revision);

  if (!(capital > 0) || !(meses > 0) || !Number.isFinite(diferencial) || antes === null) {
    avisar('Revisa los datos: el capital y los años tienen que ser números mayores que cero, y el diferencial un número como 0,75.');
    $('resumen').hidden = true;
    return;
  }
  avisar('');
  for (const id of ['capital', 'anos', 'diferencial', 'revision', 'extra']) guardar(id, $(id).value);

  const cuotaAntes = cuotaMensual(capital, meses, antes + diferencial);
  const cuotaAhora = cuotaMensual(capital, meses, ultimo.valor + diferencial);
  const dif = cuotaAhora - cuotaAntes;
  const mesUltimo = nombreMes(ultimo.mes);

  if (Math.abs(dif) < 1) {
    $('titular').textContent = 'Tu cuota se queda prácticamente igual.';
  } else {
    $('titular').textContent = `Tu cuota ${dif > 0 ? 'sube' : 'baja'} ${euros(Math.abs(dif))} al mes.`;
  }
  $('entradilla').textContent =
    `Con el Euríbor de ${mesUltimo} (${pct(ultimo.valor)}) en lugar del de ${nombreMes(revision)} (${pct(antes)}), ` +
    `pasarías de pagar ${euros(cuotaAntes)} a ${euros(cuotaAhora)} al mes.`;

  const intereses = interesesPrimerAno(capital, meses, ultimo.valor + diferencial);
  $('resumen').innerHTML = `
    <span>Al año <strong>${dif >= 0 ? '+' : '−'}${euros(Math.abs(dif * 12))}</strong></span>
    <span>Tipo total <strong>${pct(Math.max(ultimo.valor + diferencial, 0))}</strong></span>
    <span>Intereses el primer año <strong>${euros(intereses)}</strong></span>`;
  $('resumen').hidden = false;

  pintarEscenarios(capital, meses, diferencial, ultimo.valor, cuotaAhora);
  pintarAmortizar(capital, meses, ultimo.valor + diferencial);
  pintarHistoria(revision);
}

function pintarEscenarios(capital, meses, diferencial, actual, cuotaAhora) {
  const filas = [-1, -0.5, 0, 0.5, 1].map((d) => {
    const e = Math.round((actual + d) * 1000) / 1000;
    const cuota = cuotaMensual(capital, meses, e + diferencial);
    const cambio = cuota - cuotaAhora;
    return `<tr${d === 0 ? ' class="actual"' : ''}>
      <td>${pct(e)}${d === 0 ? ' <small>(actual)</small>' : ''}</td>
      <td>${euros(cuota)}</td>
      <td>${d === 0 ? '—' : `${cambio > 0 ? '+' : '−'}${euros(Math.abs(cambio))}`}</td>
    </tr>`;
  });
  $('escenarios').innerHTML = filas.join('');
  $('bloque-escenarios').hidden = false;
}

const plazoTexto = (m) => {
  const a = Math.floor(m / 12), r = m % 12;
  const partes = [a ? `${a} ${a === 1 ? 'año' : 'años'}` : '', r ? `${r} ${r === 1 ? 'mes' : 'meses'}` : ''].filter(Boolean);
  return partes.join(' y ') || '0 meses';
};

function pintarAmortizar(capital, meses, tipo) {
  const extra = entero($('extra').value);
  const bloque = $('bloque-amortizar');
  bloque.hidden = false;
  if (!(extra > 0)) {
    $('op-cuota-dato').textContent = $('op-plazo-dato').textContent = '—';
    $('op-cuota-txt').textContent = $('op-plazo-txt').textContent = 'Escribe cuánto dinero quieres adelantar.';
    return;
  }
  const r = amortizar(capital, meses, tipo, extra);
  if (r.liquida) {
    $('op-cuota-dato').textContent = $('op-plazo-dato').textContent = 'Hipoteca pagada';
    $('op-cuota-txt').textContent = $('op-plazo-txt').textContent = `Con ${euros(extra)} cancelas todo el capital pendiente y te ahorras ${euros(r.base.intereses)} de intereses.`;
    return;
  }
  $('op-cuota-dato').textContent = `${euros(r.reducirCuota.cuota)} al mes`;
  $('op-cuota-txt').textContent =
    `Pagas ${euros(r.base.cuota - r.reducirCuota.cuota)} menos cada mes durante el mismo plazo y te ahorras ${euros(r.reducirCuota.ahorro)} en intereses.`;
  $('op-plazo-dato').textContent = `${plazoTexto(r.reducirPlazo.mesesMenos)} antes`;
  $('op-plazo-txt').textContent =
    `Sigues pagando ${euros(r.base.cuota)} al mes, terminas antes y te ahorras ${euros(r.reducirPlazo.ahorro)} en intereses: ${euros(r.reducirPlazo.ahorro - r.reducirCuota.ahorro)} más que reduciendo cuota.`;
}

function pintarHistoria(revision) {
  $('bloque-historia').hidden = false;
  const svg = $('historia');
  // Se dibuja al tamaño real del gráfico para que textos y puntos no se deformen.
  const W = Math.max(svg.clientWidth, 300);
  const H = Math.max(svg.clientHeight, 180);
  const M = { t: 16, r: 12, b: 28, l: 32 };
  const cadaAnos = W < 600 ? 6 : 3;
  const min = Math.min(-1, ...serie.map((p) => p.valor));
  const max = Math.max(6, ...serie.map((p) => p.valor));
  const x = (i) => M.l + (i / (serie.length - 1)) * (W - M.l - M.r);
  const y = (v) => M.t + ((max - v) / (max - min)) * (H - M.t - M.b);

  let g = '';
  for (let v = Math.ceil(min); v <= max; v++) {
    g += `<line x1="${M.l}" x2="${W - M.r}" y1="${y(v)}" y2="${y(v)}" class="${v === 0 ? 'cero' : 'rejilla'}"/>`;
    g += `<text x="${M.l - 8}" y="${y(v) + 4}" class="eje" text-anchor="end">${v}</text>`;
  }
  serie.forEach((p, i) => {
    if (p.mes.endsWith('-01') && Number(p.mes.slice(0, 4)) % cadaAnos === 0) {
      g += `<text x="${x(i)}" y="${H - 6}" class="eje" text-anchor="middle">${p.mes.slice(0, 4)}</text>`;
    }
  });
  const linea = serie.map((p, i) => `${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ');
  g += `<polyline points="${linea}" class="linea"/>`;

  const iRev = serie.findIndex((p) => p.mes === revision);
  const iAhora = serie.length - 1;
  if (iRev >= 0 && iRev !== iAhora) {
    g += `<circle cx="${x(iRev)}" cy="${y(serie[iRev].valor)}" r="5" class="punto-revision"/>`;
  }
  g += `<circle cx="${x(iAhora)}" cy="${y(serie[iAhora].valor)}" r="6" class="punto-ahora"/>`;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = g;
  const maximo = serie.reduce((a, b) => (b.valor > a.valor ? b : a));
  const minimo = serie.reduce((a, b) => (b.valor < a.valor ? b : a));
  const resumen = `Máximo ${pct(maximo.valor)} en ${nombreMes(maximo.mes)}; mínimo ${pct(minimo.valor)} en ${nombreMes(minimo.mes)}.`;
  svg.setAttribute('aria-label', `Evolución del Euríbor a un año desde ${nombreMes(serie[0].mes)}. ${resumen}`);
  $('pie-historia').innerHTML =
    `<span class="clave ahora-clave"></span>Último publicado (${nombreMes(serie[iAhora].mes)}) ` +
    `<span class="clave revision-clave"></span>Tu última revisión. ${resumen}`;
}

async function iniciar() {
  try {
    const r = await fetch(FICHERO, { cache: 'no-cache' });
    if (!r.ok) throw new Error(r.status);
    ({ serie } = await r.json());
    if (!serie?.length) throw new Error('vacío');
  } catch {
    avisar('El Euríbor no está disponible ahora mismo. Vuelve a intentarlo en un rato.');
    $('formulario').querySelectorAll('input, select').forEach((el) => (el.disabled = true));
    return;
  }

  // Meses para elegir la última revisión: los 36 más recientes.
  const select = $('revision');
  serie.slice(-36).reverse().forEach((p) => select.add(new Option(`${nombreMes(p.mes)}: ${pct(p.valor)}`, p.mes)));
  // Por defecto, hace 12 meses (revisión anual).
  select.value = serie.at(-13)?.mes ?? serie[0].mes;

  for (const id of ['capital', 'anos', 'diferencial', 'revision', 'extra']) {
    const v = leer(id);
    if (v !== null && (id !== 'revision' || [...select.options].some((o) => o.value === v))) $(id).value = v;
    $(id).addEventListener('input', calcular);
  }
  for (const id of ['capital', 'extra']) {
    $(id).addEventListener('blur', () => {
      const n = entero($(id).value);
      if (n > 0) $(id).value = new Intl.NumberFormat('es-ES').format(n);
    });
  }
  $('formulario').addEventListener('submit', (e) => e.preventDefault());

  const f = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  $('actualizado').textContent = `Último Euríbor publicado: ${f.format(new Date(`${serie.at(-1).mes}-01T00:00:00Z`))}.`;
  calcular();

  let espera;
  new ResizeObserver(() => {
    clearTimeout(espera);
    espera = setTimeout(() => pintarHistoria($('revision').value), 100);
  }).observe($('historia'));
}

iniciar();
