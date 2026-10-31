import { test } from 'node:test';
import assert from 'node:assert/strict';
import { indiceAplicable, rentaActualizada, urlIrav } from '../assets/js/alquiler.js';
import { ganancia, perdidaInflacion, parsearBde, PLAZOS, urlSerieBde } from '../assets/js/ahorro.js';

const irav = [
  { mes: '2024-11', valor: 2.2 },
  { mes: '2024-12', valor: 2.28 },
  { mes: '2025-01', valor: 2.19 },
];

test('IRAV: en una actualización de enero vale el dato de noviembre', () => {
  assert.deepEqual(indiceAplicable(irav, '2025-01'), { mes: '2024-11', tasa: 0.022, estimado: false });
  assert.deepEqual(indiceAplicable(irav, '2025-03'), { mes: '2025-01', tasa: 0.0219, estimado: false });
});

test('IRAV: si el dato aún no se ha publicado se usa el último, como estimación', () => {
  assert.deepEqual(indiceAplicable(irav, '2025-06'), { mes: '2025-01', tasa: 0.0219, estimado: true });
  assert.equal(indiceAplicable(irav, '2024-05'), null);
  assert.equal(indiceAplicable([], '2025-01'), null);
  assert.match(urlIrav(), /DATOS_SERIE\/IRAV1/);
});

test('renta actualizada, sin bajar si el índice es negativo', () => {
  const r = rentaActualizada(1000, 0.022);
  assert.ok(Math.abs(r.nueva - 1022) < 1e-9);
  assert.equal(rentaActualizada(1000, -0.01).nueva, 1000);
});

test('Letras: intereses con base 360', () => {
  const g = ganancia(10000, 3, 360);
  assert.ok(Math.abs(g.bruto - 300) < 1e-9);
  assert.ok(Math.abs(g.neto - 243) < 1e-9);
  assert.deepEqual(ganancia(0, 3, 360), { bruto: 0, neto: 0 });
});

test('lo que se come la inflación', () => {
  assert.ok(Math.abs(perdidaInflacion(1000, 0.1, 12) - (1000 - 1000 / 1.1)) < 1e-9);
});

test('respuesta del Banco de España, de más antigua a más reciente y sin huecos', () => {
  const s = parsearBde([{ fechas: ['2026-10-09T08:00:00Z', '2026-09-04T08:00:00Z', '2026-08-01T08:00:00Z'], valores: [3.026, 2.846, null] }]);
  assert.deepEqual(s, [{ fecha: '2026-09-04', valor: 2.846 }, { fecha: '2026-10-09', valor: 3.026 }]);
  assert.equal(PLAZOS.length, 4);
  assert.match(urlSerieBde('D_DTED0G0G'), /series=D_DTED0G0G&rango=36M/);
});
