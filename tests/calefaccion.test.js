import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUTANO, TUR, tarifaPara, costeGas, precioKwh, caducados } from '../assets/js/calefaccion.js';

test('cada consumo tiene su tarifa', () => {
  assert.equal(tarifaPara(3000).id, 'TUR.1');
  assert.equal(tarifaPara(5000).id, 'TUR.1');
  assert.equal(tarifaPara(8000).id, 'TUR.2');
  assert.equal(tarifaPara(20000).id, 'TUR.3');
  assert.equal(tarifaPara(60000), null);
});

test('coste anual con la TUR', () => {
  const c = costeGas(8000);
  assert.ok(Math.abs(c.sinImpuestos - (8.17 * 12 + 8000 * 0.05042762)) < 1e-9);
  assert.ok(c.conImpuestos > c.sinImpuestos);
  assert.equal(costeGas(0), null);
});

test('butano y gas por kWh', () => {
  const p = precioKwh();
  assert.ok(p.butano > 0.05 && p.butano < 0.3);
  assert.ok(p.gas > 0.03 && p.gas < 0.3);
});

test('datos coherentes y avisos de caducidad', () => {
  assert.equal(BUTANO.historia.at(-1)[1], BUTANO.precio);
  assert.ok(BUTANO.desde < BUTANO.hasta && TUR.desde < TUR.hasta);
  assert.deepEqual(caducados(BUTANO.desde), []);
  assert.equal(caducados('2030-01-01').length, 2);
});
