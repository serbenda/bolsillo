import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsearIpc, equivalencia, interanual, urlIpc } from '../assets/js/ipc.js';

// Forma real de la respuesta del INE
const respuesta = {
  Nombre: 'Nacional. Índice general. Índice. ',
  Data: [
    { Anyo: 2025, FK_Periodo: 9, Valor: 100, Secreto: false },
    { Anyo: 2026, FK_Periodo: 8, Valor: 104.638, Secreto: false },
    { Anyo: 2026, FK_Periodo: 9, Valor: 104.978, Secreto: false },
    { Anyo: 2026, FK_Periodo: 10, Valor: null, Secreto: false },
    { Anyo: 2026, FK_Periodo: 13, Valor: 99, Secreto: false }, // periodo raro: fuera
  ],
};

test('parsea la serie del INE', () => {
  assert.deepEqual(parsearIpc(respuesta), [
    { mes: '2025-09', valor: 100 },
    { mes: '2026-08', valor: 104.638 },
    { mes: '2026-09', valor: 104.978 },
  ]);
  assert.deepEqual(parsearIpc(null), []);
});

test('equivalencia de euros entre fechas', () => {
  const serie = parsearIpc(respuesta);
  const e = equivalencia(serie, 100, '2025-09', '2026-09');
  assert.ok(Math.abs(e.cantidad - 104.978) < 1e-9);
  assert.ok(Math.abs(e.subida - 0.04978) < 1e-9);
  assert.equal(equivalencia(serie, 100, '1999-01', '2026-09'), null);
});

test('inflación interanual', () => {
  const t = interanual(parsearIpc(respuesta));
  assert.equal(t.length, 1);
  assert.equal(t[0].mes, '2026-09');
  assert.ok(Math.abs(t[0].tasa - 0.04978) < 1e-9);
});

test('URL de la serie vigente', () => {
  assert.match(urlIpc(), /IPC290751\?nult=1000$/);
});
