import { test } from 'node:test';
import assert from 'node:assert/strict';
import { urlEuribor, parsearEuribor, cuotaMensual, interesesPrimerAno, euriborDe } from '../assets/js/euribor.js';

// Forma real de la respuesta del BdE (fechas de más reciente a más antigua)
const respuesta = [
  {
    serie: 'D_1NBAF472',
    descripcion: 'Euribor a un año',
    codFrecuencia: 'M',
    fechas: ['2026-09-01T08:15:00Z', '2026-08-01T08:15:00Z', '2026-07-01T08:15:00Z', '2026-06-01T08:15:00Z'],
    valores: [3.247, 2.954, null, 2.855],
  },
];

test('parsea la serie, la ordena y descarta huecos', () => {
  assert.deepEqual(parsearEuribor(respuesta), [
    { mes: '2026-06', valor: 2.855 },
    { mes: '2026-08', valor: 2.954 },
    { mes: '2026-09', valor: 3.247 },
  ]);
  assert.deepEqual(parsearEuribor(null), []);
  assert.deepEqual(parsearEuribor({}), []);
});

test('URL del Banco de España', () => {
  const u = new URL(urlEuribor());
  assert.equal(u.searchParams.get('series'), 'D_1NBAF472');
  assert.equal(u.searchParams.get('rango'), 'MAX');
});

test('cuota de un préstamo francés', () => {
  // 150.000 € a 25 años al 4 %: 791,76 €/mes (valor de referencia de cualquier simulador)
  assert.equal(Math.round(cuotaMensual(150000, 300, 4) * 100) / 100, 791.76);
  // Al 0 %, capital entre meses
  assert.equal(cuotaMensual(120000, 240, 0), 500);
  // Un tipo negativo no baja la cuota por debajo del 0 %
  assert.equal(cuotaMensual(120000, 240, -0.4), 500);
  assert.equal(cuotaMensual(0, 240, 3), 0);
});

test('intereses del primer año', () => {
  const int = interesesPrimerAno(150000, 300, 4);
  assert.ok(int > 5800 && int < 6000, int); // ~5.940 €
  assert.equal(interesesPrimerAno(120000, 240, 0), 0);
});

test('euríbor de un mes', () => {
  const serie = parsearEuribor(respuesta);
  assert.equal(euriborDe(serie, '2026-08'), 2.954);
  assert.equal(euriborDe(serie, '2026-07'), null);
});
