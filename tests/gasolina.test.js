import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numero, compactar, expandir, distanciaKm, cercanas, centroCodigoPostal } from '../assets/js/carburantes.js';

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
    estacion({ IDEESS: '6', 'Rótulo': 'Nº 10.935', 'Latitud': '30,0' }), // sin marca, lejos
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
