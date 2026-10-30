import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsearPvpc, urlPvpc, fechaMadrid, horaMadrid } from '../assets/js/ree.js';
import { mejorTramo, clasificar, media } from '../assets/js/ventana.js';

const respuestaREE = {
  data: { id: 'mer13' },
  included: [
    {
      type: 'PVPC (€/MWh)',
      id: '1001',
      attributes: {
        title: 'PVPC (€/MWh)',
        values: [
          { value: 150.95, percentage: 1, datetime: '2026-10-30T00:00:00.000+01:00' },
          { value: 100, percentage: 1, datetime: '2026-10-30T01:00:00.000+01:00' },
          { value: 120, percentage: 1, datetime: '2026-10-30T01:15:00.000+01:00' },
        ],
      },
    },
  ],
};

test('parsea el PVPC a €/kWh y agrupa tramos de la misma hora', () => {
  assert.deepEqual(parsearPvpc(respuestaREE), [
    { hora: 0, precio: 0.15095 },
    { hora: 1, precio: 0.11 },
  ]);
});

test('respuesta vacía o rara no rompe', () => {
  assert.deepEqual(parsearPvpc({}), []);
  assert.deepEqual(parsearPvpc(null), []);
});

test('la URL pide la península por horas', () => {
  const u = new URL(urlPvpc('2026-10-30'));
  assert.equal(u.searchParams.get('start_date'), '2026-10-30T00:00');
  assert.equal(u.searchParams.get('geo_ids'), '8741');
  assert.equal(u.searchParams.get('time_trunc'), 'hour');
});

test('fecha y hora en Madrid', () => {
  const base = new Date('2026-10-30T23:30:00Z'); // 00:30 del 31 en Madrid
  assert.equal(fechaMadrid(0, base), '2026-10-31');
  assert.equal(fechaMadrid(1, base), '2026-11-01');
  assert.equal(horaMadrid(base), 0);
});

const dia = (fecha, precios) => precios.map((precio, hora) => ({ fecha, hora, precio }));

test('mejor tramo de dos horas', () => {
  const horas = dia('2026-10-30', [5, 4, 1, 2, 9, 0.5, 8]);
  const t = mejorTramo(horas, 2);
  assert.equal(t.inicio.hora, 2);
  assert.equal(t.media, 1.5);
});

test('el tramo puede cruzar la medianoche', () => {
  const hoy = dia('2026-10-30', Array(24).fill(10));
  hoy[23].precio = 1;
  const manana = dia('2026-10-31', [1, 10, 10]);
  const t = mejorTramo([...hoy, ...manana], 2);
  assert.equal(t.inicio.fecha, '2026-10-30');
  assert.equal(t.inicio.hora, 23);
});

test('no une horas que no son seguidas', () => {
  const horas = [
    { fecha: 'a', hora: 3, precio: 1 },
    { fecha: 'a', hora: 7, precio: 1 },
    { fecha: 'a', hora: 8, precio: 5 },
  ];
  assert.equal(mejorTramo(horas, 2).inicio.hora, 7);
  assert.equal(mejorTramo(horas.slice(0, 2), 2), null);
});

test('clasifica por terciles', () => {
  const c = clasificar(dia('x', [1, 2, 3, 4, 5, 6]));
  assert.deepEqual(c, ['barata', 'barata', 'media', 'media', 'cara', 'cara']);
  assert.equal(media(dia('x', [1, 3])), 2);
});
