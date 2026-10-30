import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsearGeneracion, preciosDiarios, combinar, efectoRenovables, urlGeneracion } from '../assets/js/generacion.js';

const serie = (type, valores) => ({
  type,
  attributes: { values: valores.map(([d, v]) => ({ value: v, datetime: `${d}T00:00:00.000+01:00` })) },
});

const generacion = {
  included: [
    serie('Solar fotovoltaica', [['2026-10-29', 300], ['2026-10-30', 100]]),
    serie('Eólica', [['2026-10-29', 200], ['2026-10-30', 100]]),
    serie('Ciclo combinado', [['2026-10-29', 100], ['2026-10-30', 500]]),
    serie('Nuclear', [['2026-10-29', 400], ['2026-10-30', 300]]),
    serie('Generación total', [['2026-10-29', 1000], ['2026-10-30', 1000]]),
  ],
};

test('agrupa la generación por tecnología y día', () => {
  const g = parsearGeneracion(generacion);
  assert.deepEqual(g['2026-10-29'], { total: 1000, grupos: { solar: 300, eolica: 200, gas: 100, nuclear: 400 } });
  assert.deepEqual(parsearGeneracion(null), {});
});

test('precio medio diario en €/kWh', () => {
  const p = preciosDiarios({
    included: [{ id: '1001', type: 'PVPC', attributes: { values: [
      { value: 100, datetime: '2026-10-29T00:00:00.000+01:00' },
      { value: 200, datetime: '2026-10-29T01:00:00.000+01:00' },
      { value: 50, datetime: '2026-10-30T00:00:00.000+01:00' },
    ] } }],
  });
  assert.deepEqual(p, { '2026-10-29': 0.15, '2026-10-30': 0.05 });
});

test('combina generación y precio con el porcentaje renovable', () => {
  const dias = combinar(parsearGeneracion(generacion), { '2026-10-29': 0.1, '2026-10-30': 0.2 });
  assert.equal(dias.length, 2);
  assert.equal(dias[0].renovable, 0.5);
  assert.equal(dias[1].renovable, 0.2);
  assert.equal(dias[0].reparto.solar, 0.3);
  assert.equal(dias[1].precio, 0.2);
});

test('efecto de las renovables en el precio', () => {
  const dias = [0.1, 0.2, 0.3, 0.6, 0.7, 0.8].map((r, i) => ({ fecha: `d${i}`, renovable: r, precio: 0.3 - r / 4 }));
  const e = efectoRenovables(dias);
  assert.equal(e.dias, 6);
  assert.ok(e.muchas.precio < e.pocas.precio);
  assert.ok(Math.abs(e.muchas.renovable - 0.7) < 1e-9);
  assert.equal(efectoRenovables(dias.slice(0, 3)), null);
});

test('URL de generación peninsular por días', () => {
  const u = new URL(urlGeneracion('2026-10-01', '2026-10-30'));
  assert.equal(u.searchParams.get('time_trunc'), 'day');
  assert.equal(u.searchParams.get('geo_ids'), '8741');
});
