import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// aviso-luz.js es un script clásico para el service worker: se carga igual que allí
const contexto = { self: {} };
vm.runInNewContext(await readFile(new URL('../assets/js/aviso-luz.js', import.meta.url), 'utf8'), contexto);
const { avisoLuz } = contexto.self;

const dia = Array.from({ length: 24 }, (_, hora) => ({ hora, precio: hora === 14 ? 0.01 : hora === 20 ? 0.3 : 0.1 }));

test('aviso con la hora más barata y la más cara de mañana', () => {
  const datos = { dias: { '2026-11-01': dia } };
  assert.deepEqual({ ...avisoLuz(datos, '2026-11-01', 'es') }, { titulo: 'La luz de mañana', cuerpo: 'Más barata de 14 a 15 h; más cara de 20 a 21 h.' });
  assert.equal(avisoLuz(datos, '2026-11-01', 'en').cuerpo, 'Cheapest from 14:00 to 15:00; most expensive from 20:00 to 21:00.');
});

test('sin precios de mañana no hay aviso', () => {
  assert.equal(avisoLuz({ dias: {} }, '2026-11-01', 'es'), null);
  assert.equal(avisoLuz({ dias: { '2026-11-01': dia.slice(0, 10) } }, '2026-11-01', 'es'), null);
  assert.equal(avisoLuz(null, '2026-11-01', 'es'), null);
});
