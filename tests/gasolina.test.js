import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numero, compactar, expandir, distanciaKm, cercanas, centroCodigoPostal, porProvincias, provinciasCercanas, abierta, codigosPostales, actualizarHistorico, tendencia, fechaIso } from '../assets/js/carburantes.js';

const estacion = (extra) => ({
  'C.P.': '28100',
  'Dirección': 'AVENIDA DE LA INDUSTRIA, 4',
  'Horario': 'L-D: 24H',
  'Latitud': '40,537583',
  'Longitud (WGS84)': '-3,640861',
  'Municipio': 'ALCOBENDAS',
  'Provincia': 'MADRID',
  'Rótulo': 'GASOLINERA UNO',
  'Tipo Venta': 'P',
  'IDEESS': '1',
  'IDProvincia': '28',
  'Precio Gasolina 95 E5': '1,459',
  'Precio Gasolina 98 E5': '',
  'Precio Gasoleo A': '1,399',
  'Precio Gasoleo Premium': '',
  'Precio Gases licuados del petróleo': '',
  ...extra,
});

const respuesta = {
  Fecha: '30/10/2026 21:10:33',
  ResultadoConsulta: 'OK',
  ListaEESSPrecio: [
    estacion(),
    estacion({ IDEESS: '2', 'Rótulo': 'DOS', 'Latitud': '40,5', 'Precio Gasolina 95 E5': '1,409', 'C.P.': '28700' }),
    estacion({ IDEESS: '3', 'Tipo Venta': 'R' }), // venta restringida: fuera
    estacion({ IDEESS: '4', 'Latitud': '' }), // sin coordenadas: fuera
    estacion({ IDEESS: '5', 'Precio Gasolina 95 E5': '', 'Precio Gasoleo A': '' }), // sin precios: fuera
    estacion({ IDEESS: '6', 'Rótulo': 'Nº 10.935', 'Latitud': '30,0', 'IDProvincia': '35' }), // sin marca, lejos
  ],
};

test('números con coma decimal', () => {
  assert.equal(numero('1,459'), 1.459);
  assert.equal(numero(''), null);
  assert.equal(numero(undefined), null);
  assert.equal(numero('abc'), null);
});

test('compacta solo las estaciones útiles', () => {
  const d = compactar(respuesta);
  assert.equal(d.fecha, '2026-10-30T21:10:33');
  assert.deepEqual(d.estaciones.map((e) => e[0]), ['1', '2', '6']);
  assert.equal(d.estaciones[2][1], '', 'el número de registro no es una marca');
  assert.equal(d.medias.g95, 1.442);
  assert.equal(d.medias.g98, null);

  const [uno] = expandir(d);
  assert.equal(uno.direccion, 'Avenida de la Industria, 4');
  assert.equal(uno.municipio, 'Alcobendas');
  assert.equal(uno.lat, 40.53758);
  assert.equal(uno.g95, 1.459);
  assert.equal(uno.g98, null);
});

test('distancia Madrid–Barcelona ≈ 505 km', () => {
  const km = distanciaKm(40.4168, -3.7038, 41.3874, 2.1686);
  assert.ok(km > 495 && km < 515, km);
});

test('cercanas ordena por precio y filtra por radio', () => {
  const lista = expandir(compactar(respuesta));
  const centro = { lat: 40.53, lon: -3.64 };
  assert.deepEqual(cercanas(lista, centro, 10, 'g95').map((e) => e.id), ['2', '1']);
  assert.deepEqual(cercanas(lista, centro, 2, 'g95').map((e) => e.id), ['1']);
  assert.deepEqual(cercanas(lista, centro, 10, 'g98'), []);
});

test('centro de un código postal', () => {
  const lista = expandir(compactar(respuesta));
  const c = centroCodigoPostal(lista, '28100');
  assert.equal(c.municipio, 'Alcobendas');
  assert.equal(centroCodigoPostal(lista, '99999'), null);
});

test('reparte por provincias con su caja', () => {
  const { indice, provincias } = porProvincias(compactar(respuesta));
  assert.deepEqual(Object.keys(provincias).sort(), ['28', '35']);
  assert.equal(provincias['28'].estaciones.length, 2);
  assert.equal(indice.provincias['28'].n, 2);
  assert.deepEqual(indice.provincias['28'].caja, [40.5, -3.64086, 40.53758, -3.64086]);
  assert.ok(indice.medias.g95 > 1.4);
  // Desde Alcobendas, a 25 km solo hace falta Madrid
  assert.deepEqual(provinciasCercanas(indice, { lat: 40.54, lon: -3.64 }, 25), ['28']);
});

test('horarios: abierta o cerrada', () => {
  const lunes10 = { dia: 0, min: 600 };
  const sabado15 = { dia: 5, min: 900 };
  const domingo3 = { dia: 6, min: 180 };
  assert.equal(abierta('L-D: 24H', domingo3), true);
  assert.equal(abierta('L-V: 07:00-22:00; S-D: 08:00-14:00', lunes10), true);
  assert.equal(abierta('L-V: 07:00-22:00; S-D: 08:00-14:00', sabado15), false);
  assert.equal(abierta('L-S: 07:00-14:00 y 16:00-21:00', { dia: 2, min: 15 * 60 }), false);
  assert.equal(abierta('L-S: 07:00-14:00 y 16:00-21:00', { dia: 2, min: 17 * 60 }), true);
  assert.equal(abierta('L-D: 22:00-06:00', domingo3), true); // pasa de medianoche
  assert.equal(abierta('V-L: 08:00-20:00', lunes10), true); // rango de días que da la vuelta
  assert.equal(abierta('L-V: 07:00-22:00', domingo3), false);
  assert.equal(abierta('Consultar en la estación', lunes10), null);
  assert.equal(abierta('', lunes10), null);
});

test('códigos postales de GeoNames', () => {
  const tsv = [
    ['ES', '28100', 'Alcobendas', 'Comunidad de Madrid', 'MD', 'Madrid', 'M', '', '', '40.5475', '-3.6420', '4'],
    ['ES', '28100', 'Alcobendas centro', 'Comunidad de Madrid', 'MD', 'Madrid', 'M', '', '', '40.5375', '-3.6320', '4'],
    ['ES', '35001', 'Las Palmas', 'Canarias', 'CN', 'Las Palmas', 'GC', '', '', '28.1', '-15.4', '4'],
    ['FR', '75001', 'Paris', '', '', '', '', '', '', '48.8', '2.3', '4'],
  ].map((c) => c.join('\t')).join('\n');
  assert.deepEqual(codigosPostales(tsv), {
    28: { 28100: [40.5425, -3.637, 'Alcobendas'] },
    35: { 35001: [28.1, -15.4, 'Las Palmas'] },
  });
});

test('histórico: añade el día, sustituye si se repite y recorta', () => {
  const { indice } = porProvincias(compactar(respuesta));
  assert.equal(indice.provincias['28'].medias.g95, 1.434);
  let h = actualizarHistorico(null, indice);
  assert.equal(h.nacional.length, 1);
  assert.equal(h.nacional[0].f, '2026-10-30');
  assert.equal(h.provincias['28'][0].g95, 1.434);
  h = actualizarHistorico(h, indice); // misma fecha: no se duplica
  assert.equal(h.nacional.length, 1);
  const viejo = { nacional: Array.from({ length: 5 }, (_, i) => ({ f: `2026-10-2${i}`, g95: 1.5 })), provincias: {} };
  assert.equal(actualizarHistorico(viejo, indice, 3).nacional.length, 3);
});

test('tendencia frente a la semana anterior', () => {
  const serie = Array.from({ length: 9 }, (_, i) => ({ f: `2026-10-${String(22 + i).padStart(2, '0')}`, g95: i === 8 ? 1.5 : 1.55 }));
  const t = tendencia(serie, 'g95');
  assert.equal(t.hoy, 1.5);
  assert.ok(Math.abs(t.media7 - 1.55) < 1e-9);
  assert.ok(t.diferencia < 0);
  assert.equal(t.hace7, 1.55);
  assert.equal(tendencia(serie.slice(0, 1), 'g95'), null);
  assert.equal(tendencia(serie, 'g98'), null);
});

test('fecha del Ministerio con hora de una o dos cifras', () => {
  assert.equal(fechaIso('30/10/2026 21:10:33'), '2026-10-30T21:10:33');
  assert.equal(fechaIso('31/10/2026 8:19:13'), '2026-10-31T08:19:13');
  assert.equal(fechaIso('1/11/2026 0:05'), '2026-11-01T00:05:00');
  assert.equal(fechaIso('raro'), null);
  assert.equal(fechaIso(undefined), null);
});
