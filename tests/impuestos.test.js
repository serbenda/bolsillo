import { test } from 'node:test';
import assert from 'node:assert/strict';
import { factorImpuestos, impuestosEn, APARATOS } from '../assets/js/impuestos.js';

test('impuesto eléctrico e IVA sobre el término de energía', () => {
  const f = factorImpuestos('2026-10-30');
  assert.equal(Math.round(f * 1e6) / 1e6, Math.round(1.0511269632 * 1.21 * 1e6) / 1e6);
  assert.equal(impuestosEn('2026-10-30').iva, 0.21);
});

test('aparatos con datos coherentes', () => {
  for (const a of APARATOS) {
    assert.ok(a.kwh > 0 && a.horas >= 1 && a.horas <= 8, a.id);
    assert.ok(a.pregunta.startsWith('¿') && ['la', 'lo'].includes(a.lo), a.id);
  }
});
