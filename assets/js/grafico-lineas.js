// Gráfico de líneas sencillo en SVG, con meses (YYYY-MM) en el eje horizontal y porcentajes en el vertical.

/**
 * @param svg     elemento <svg>
 * @param series  [{ clase, puntos: [{ mes, valor }] }]; la primera se dibuja encima
 * @param opciones { paso: separación de las líneas del eje, sufijo: texto tras cada número del eje }
 */
export function graficoLineas(svg, series, { paso = 1, sufijo = '' } = {}) {
  const meses = [...new Set(series.flatMap((s) => s.puntos.map((p) => p.mes)))].sort();
  if (meses.length < 2) { svg.innerHTML = ''; return; }
  const valores = series.flatMap((s) => s.puntos.map((p) => p.valor));
  const W = Math.max(svg.clientWidth, 300);
  const H = Math.max(svg.clientHeight, 180);
  const M = { t: 16, r: 46, b: 28, l: 40 };
  // El eje empieza en 0 si algún dato está cerca; si no, justo por debajo del mínimo para que se vean las diferencias
  const minimo = Math.min(...valores);
  const min = minimo < paso * 1.5 ? Math.min(0, Math.floor(minimo / paso) * paso) : Math.floor(minimo / paso) * paso - paso;
  const max = Math.ceil(Math.max(...valores) / paso) * paso || paso;
  const x = (mes) => M.l + (meses.indexOf(mes) / (meses.length - 1)) * (W - M.l - M.r);
  const y = (v) => M.t + ((max - v) / (max - min)) * (H - M.t - M.b);
  let g = '';
  for (let v = min; v <= max + 1e-9; v += paso) {
    g += `<line x1="${M.l}" x2="${W - M.r}" y1="${y(v)}" y2="${y(v)}" class="${v === 0 ? 'cero' : 'rejilla'}"/>`;
    g += `<text x="${M.l - 8}" y="${y(v) + 4}" class="eje" text-anchor="end">${Number(v.toFixed(2))}${sufijo}</text>`;
  }
  // Un rótulo por año (enero), o el primer mes si la serie empieza a mitad de año
  const cada = meses.length > 48 && W < 600 ? 2 : 1;
  meses.forEach((m, i) => {
    const primerEnero = meses.findIndex((x) => x.endsWith('-01'));
    const hueco = primerEnero < 0 || primerEnero / meses.length > 0.15; // que el rótulo del primer mes no pise al de enero
    if ((m.endsWith('-01') && Number(m.slice(0, 4)) % cada === 0) || (i === 0 && !m.endsWith('-01') && meses.length < 30 && hueco)) {
      g += `<text x="${x(m)}" y="${H - 6}" class="eje" text-anchor="${i === 0 ? 'start' : 'middle'}">${m.slice(0, 4)}</text>`;
    }
  });
  for (const s of [...series].reverse()) {
    const pts = s.puntos.map((p) => `${x(p.mes).toFixed(1)},${y(p.valor).toFixed(1)}`).join(' ');
    g += `<polyline points="${pts}" class="linea ${s.clase ?? ''}"/>`;
  }
  const principal = series[0].puntos.at(-1);
  g += `<circle cx="${x(principal.mes)}" cy="${y(principal.valor)}" r="5" class="punto-ahora"/>`;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = g;
}
