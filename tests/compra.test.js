import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTOS, ALIMENTOS, mesesAntes, variacion, ranking, compraHoy, urlSerie, anual, costeAnual } from '../assets/js/compra.js';

const serie = (valores, ultimo = '2026-09') =>
  valores.map((valor, i) => ({ mes: mesesAntes(ultimo, valores.length - 1 - i), valor }));

test('meses hacia atrás, cruzando años', () => {
  assert.equal(mesesAntes('2026-09', 12), '2025-09');
  assert.equal(mesesAntes('2026-01', 1), '2025-12');
  assert.equal(mesesAntes('2026-03', 26), '2024-01');
});

test('variación en un periodo', () => {
  const s = serie([100, ...Array(11).fill(105), 110]); // 13 meses
  const v = variacion(s, 12);
  assert.equal(v.desde, '2025-09');
  assert.equal(v.hasta, '2026-09');
  assert.ok(Math.abs(v.variacion - 0.1) < 1e-9);
  assert.equal(variacion(s, 24), null); // no hay tantos meses
  assert.equal(variacion([], 12), null);
});

test('ranking de lo que más sube a lo que más baja', () => {
  const r = ranking(
    [
      { id: 'a', serie: serie([100, 90]) },
      { id: 'b', serie: serie([100, 130]) },
      { id: 'c', serie: serie([100]) }, // sin datos suficientes
    ],
    1
  );
  assert.deepEqual(r.map((p) => p.id), ['b', 'a']);
});

test('lo que cuesta hoy la compra de entonces', () => {
  const c = compraHoy(serie([100, 104]), 100, 1);
  assert.ok(Math.abs(c.hoy - 104) < 1e-9);
});

test('lista de productos coherente', () => {
  const ids = new Set();
  for (const p of [ALIMENTOS, ...PRODUCTOS]) {
    assert.match(p.cod, /^IPC\d+$/, p.id);
    assert.ok(p.es && p.en, p.id);
    assert.ok(!ids.has(p.id), `repetido: ${p.id}`);
    ids.add(p.id);
  }
  assert.match(urlSerie('IPC290811'), /DATOS_SERIE\/IPC290811\?nult=\d+$/);
});

test('variación de cada año, de diciembre a diciembre', () => {
  // De 2024-12 a 2026-09: 100 en dic. 2024, 110 en dic. 2025, 121 en sep. 2026
  const s = serie([100, ...Array(11).fill(105), 110, ...Array(8).fill(115), 121], '2026-09');
  const a = anual(s);
  assert.deepEqual(a.map((x) => x.anyo), [2025, 2026]);
  assert.ok(Math.abs(a[0].variacion - 0.1) < 1e-9);
  assert.equal(a[0].parcial, false);
  assert.equal(a[1].hasta, '2026-09');
  assert.equal(a[1].parcial, true);
  assert.deepEqual(anual([]), []);
});

test('lo que costaba cada año la compra de hoy', () => {
  // dic. 2024 = 80, dic. 2025 = 90, sep. 2026 = 100
  const s = serie([80, ...Array(11).fill(85), 90, ...Array(8).fill(95), 100], '2026-09');
  const c = costeAnual(s, 50);
  assert.deepEqual(c.map((x) => x.anyo), [2024, 2025, 2026]);
  assert.deepEqual(c.map((x) => x.coste), [40, 45, 50]);
  assert.equal(c.at(-1).mes, '2026-09');
  assert.deepEqual(costeAnual([], 50), []);
});
