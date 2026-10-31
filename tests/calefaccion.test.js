import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BUTANO, TUR, tarifaPara, costeGas, precioKwh, caducados, parsearButano, parsearTur, finTrimestre } from '../assets/js/calefaccion.js';

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

// Fragmentos reales de las fuentes, tal como llegan (la página del Ministerio trae el HTML escapado)
test('tabla del butano del Ministerio', async () => {
  const filas = parsearButano(await readFile(new URL('fragmentos/butano-miteco.txt', import.meta.url), 'utf8'));
  assert.deepEqual(filas, [
    { desde: '2026-01-20', hasta: '2026-03-16', precio: 15.58 },
    { desde: '2026-07-21', hasta: '2026-09-14', precio: 17.83 },
    { desde: '2026-09-15', hasta: '2026-11-16', precio: 18.84 },
  ]);
});

test('resolución de la TUR del BOE', async () => {
  const t = parsearTur(await readFile(new URL('fragmentos/tur-boe.xml', import.meta.url), 'utf8'));
  assert.deepEqual(t.map((x) => [x.id, x.fijoMes, x.variable]), [['TUR.1', 3.83, 0.0525259], ['TUR.2', 8.17, 0.05042762], ['TUR.3', 19.32, 0.04698799]]);
  assert.equal(parsearTur('<tr><td>nada</td></tr>'), null);
  assert.equal(finTrimestre('2026-10-01'), '2026-12-31');
});
