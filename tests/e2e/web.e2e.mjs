// Tests de navegador: cargan la web ya preparada (_site) con datos reales y comprueban
// que cada página funciona, no da errores y pasa la auditoría de accesibilidad (axe).
// Los ejecuta la Action antes de publicar: si fallan, no se publica.
// Uso: node --test tests/e2e/   (necesita playwright y @axe-core/playwright instalados)

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { arrancar } from './servidor.mjs';

let servidor, navegador, base;

before(async () => {
  servidor = await arrancar();
  base = servidor.base;
  navegador = await chromium.launch();
});

after(async () => {
  await navegador?.close();
  await servidor?.cerrar();
});

async function abrir(ruta, opciones = {}) {
  const contexto = await navegador.newContext({ locale: 'es-ES', timezoneId: 'Europe/Madrid', ...opciones });
  const pagina = await contexto.newPage();
  const errores = [];
  pagina.on('pageerror', (e) => errores.push(e.message));
  // Fuera de la web (mapas, visitas): no se descarga nada en los tests
  await pagina.route((url) => !url.href.startsWith(base), (r) => r.abort());
  await pagina.goto(base + ruta);
  await pagina.waitForLoadState('networkidle');
  return { pagina, errores, contexto };
}

async function accesible(pagina) {
  const { violations } = await new AxeBuilder({ page: pagina }).withTags(['wcag2a', 'wcag2aa']).analyze();
  const graves = violations.filter((v) => ['serious', 'critical'].includes(v.impact));
  assert.deepEqual(graves.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(', ')}`), []);
}

test('portada: recibo con datos del día', async () => {
  const { pagina, errores, contexto } = await abrir('');
  assert.deepEqual(errores, []);
  assert.match(await pagina.textContent('#r-luz'), /€\/kWh/);
  assert.match(await pagina.textContent('#r-g95'), /€\/l/);
  assert.match(await pagina.textContent('#r-euribor'), /%/);
  assert.match(await pagina.textContent('#r-ipc'), /%/);
  assert.match(await pagina.textContent('#r-compra'), /%/);
  assert.match(await pagina.textContent('#r-letras'), /%/);
  assert.match(await pagina.textContent('#r-alquiler'), /%/);
  await accesible(pagina);
  await contexto.close();
});

test('luz: titular, gráfico y coste por aparato', async () => {
  const { pagina, errores, contexto } = await abrir('luz/');
  assert.deepEqual(errores, []);
  assert.doesNotMatch(await pagina.textContent('#titular'), /Cargando|no está disponible/);
  assert.ok((await pagina.locator('#grafico .barra').count()) >= 23, 'barras de 24 horas');
  assert.equal(await pagina.locator('#costes tr').count(), 5);
  await pagina.click('text=Secadora');
  assert.match(await pagina.textContent('#t-plan'), /secadora/);
  await pagina.click('#con-impuestos');
  assert.match(await pagina.textContent('#ahorro'), /sin impuestos/);
  // Por qué está cara o barata: lo que se pinta tiene que cuadrar con los datos publicados
  // (si REE no dio datos de generación, la sección no aparece y la página sigue funcionando)
  let gen = null;
  try {
    gen = JSON.parse(await readFile(new URL('../../_site/data/generacion.json', import.meta.url), 'utf8')).dias;
  } catch {}
  if (gen?.length) {
    const conPrecio = gen.filter((d) => d.precio !== null).length;
    assert.match(await pagina.textContent('#gen-frase'), /renovable/);
    assert.ok((await pagina.locator('#mezcla .seg').count()) >= 2, `segmentos de generación: ${await pagina.locator('#mezcla .seg').count()}`);
    assert.equal(await pagina.locator('#grafico-dias .barra').count(), conPrecio, 'un día por barra');
  } else {
    assert.equal(await pagina.locator('#bloque-porque').isVisible(), false, 'sin datos, la sección no se muestra');
  }
  await accesible(pagina);
  await contexto.close();
});

test('gasolina: búsqueda por código postal', async () => {
  const { pagina, errores, contexto } = await abrir('gasolina/');
  assert.deepEqual(errores, []);
  await pagina.fill('#cp', '28100');
  await pagina.click('button[type=submit]');
  await pagina.waitForSelector('.estacion', { timeout: 10000 });
  assert.match(await pagina.textContent('#titular'), /€\/l/);
  assert.ok((await pagina.locator('.estacion').count()) > 0, 'gasolineras en la lista');
  await accesible(pagina);
  await contexto.close();
});

test('gasolina: búsqueda por ubicación', async () => {
  const { pagina, contexto } = await abrir('gasolina/', {
    geolocation: { latitude: 41.3874, longitude: 2.1686 }, // Barcelona
    permissions: ['geolocation'],
  });
  await pagina.click('#ubicacion');
  await pagina.waitForSelector('.estacion', { timeout: 10000 });
  assert.match(await pagina.textContent('#entradilla'), /cerca de ti/);
  await contexto.close();
});

test('hipoteca: cuota con el último Euríbor', async () => {
  const { pagina, errores, contexto } = await abrir('hipoteca/');
  assert.deepEqual(errores, []);
  assert.match(await pagina.textContent('#titular'), /cuota/i);
  assert.equal(await pagina.locator('#escenarios tr').count(), 5);
  await pagina.fill('#capital', '200000');
  assert.match(await pagina.textContent('#entradilla'), /pasarías de pagar/);
  await pagina.fill('#extra', '20000');
  assert.match(await pagina.textContent('#op-plazo-dato'), /antes/);
  assert.match(await pagina.textContent('#op-cuota-dato'), /al mes/);
  await accesible(pagina);
  await contexto.close();
});

test('inflación: calculadora del IPC', async () => {
  const { pagina, errores, contexto } = await abrir('ipc/');
  assert.deepEqual(errores, []);
  assert.match(await pagina.textContent('#titular'), /%/);
  await pagina.fill('#cantidad', '250');
  assert.match(await pagina.textContent('#resultado'), /^250,00\s€ de .+ equivalen a .+\s€ de /);
  assert.ok((await pagina.locator('#historia polyline').count()) === 1);
  await accesible(pagina);
  await contexto.close();
});

test('compra: lo que sube y lo que baja', async () => {
  const { pagina, errores, contexto } = await abrir('compra/');
  assert.deepEqual(errores, []);
  assert.match(await pagina.textContent('#titular'), /^La compra cuesta hoy un .+ (más|menos) que hace un año\.$/);
  assert.ok((await pagina.locator('#productos .producto').count()) >= 15);
  await pagina.fill('#gasto', '80');
  assert.match(await pagina.textContent('#resultado'), /^La misma compra hoy te cuesta .+\s€\.$/);
  await pagina.check('input[name=periodo][value="60"]');
  assert.match(await pagina.textContent('#t-productos'), /5 años/);
  assert.match(await pagina.textContent('#etiqueta-gasto'), /hace 5 años/);
  // Año a año, de la comida y de un producto
  assert.ok((await pagina.locator('#anual .producto').count()) >= 10);
  assert.match(await pagina.textContent('#resumen-anual'), /^Toda la comida: [+−].+ desde .+ cuesta hoy/);
  await pagina.selectOption('#producto-anual', 'huevos');
  assert.equal(await pagina.locator('#grafico-compra polyline').count(), 3); // huevos, toda la comida e IPC general
  assert.match(await pagina.textContent('#pie-grafico'), /^Precio comparado con .+ \(= 100\)\. Huevos: \d+ hoy/);
  assert.match(await pagina.textContent('#resumen-anual'), /^Huevos: /);
  // En euros: lo que costaba cada año la compra de hoy
  await pagina.check('input[name=vista-anual][value="coste"]');
  await pagina.fill('#gasto-hoy', '100');
  assert.match(await pagina.textContent('#resumen-anual'), /^Huevos: lo que hoy te cuesta 100,00\s€ costaba .+\s€ en 2002/);
  assert.match((await pagina.textContent('#anual .producto:first-child')).replace(/\s+/g, ' ').trim(), /^Hoy \(.+\) 100,00 €$/);
  await accesible(pagina);
  await contexto.close();
});

test('compartir: copia el titular y el enlace cuando no se puede compartir', async () => {
  const { pagina, errores, contexto } = await abrir('compra/', { permissions: ['clipboard-read', 'clipboard-write'] });
  await pagina.evaluate(() => { delete Navigator.prototype.share; });
  await pagina.click('[data-compartir]');
  await pagina.waitForFunction(() => document.querySelector('.estado-compartir').textContent);
  assert.match(await pagina.textContent('.estado-compartir'), /^Copiado/);
  const copiado = await pagina.evaluate(() => navigator.clipboard.readText());
  assert.match(copiado, /^La compra cuesta hoy un .+\n.+\/compra\/$/);
  // La imagen para WhatsApp se genera con el tamaño de las tarjetas de redes
  const tam = await pagina.evaluate(async () => {
    const { imagen } = await import('../assets/js/compartir.js');
    const b = await imagen('Titular de prueba bastante largo para ver que se parte en varias líneas', 'Detalle');
    const i = await createImageBitmap(b);
    return [i.width, i.height];
  });
  assert.deepEqual(tam, [1200, 630]);
  assert.deepEqual(errores, []);
  await contexto.close();
});

test('inflación: sueldo frente a los precios', async () => {
  const { pagina, errores, contexto } = await abrir('ipc/');
  await pagina.fill('#sueldo-antes', '1.500');
  await pagina.fill('#sueldo-hoy', '1.000');
  assert.match(await pagina.textContent('#resultado-sueldo'), /^Has perdido poder de compra: hoy puedes comprar un .+ menos que en \d{4}\.$/);
  await pagina.fill('#sueldo-hoy', '5.000');
  assert.match(await pagina.textContent('#resultado-sueldo'), /^Has ganado poder de compra/);
  assert.match(await pagina.textContent('#detalle-sueldo'), /necesitarías cobrar .+ al mes/);
  assert.deepEqual(errores, []);
  await contexto.close();
});

test('gasolina: precio por provincia', async () => {
  const { pagina, errores, contexto } = await abrir('gasolina/');
  assert.match(await pagina.textContent('#provincias-frase'), /^Hoy .+ está más barat[ao] en .+ y más car[ao] en .+ Media de España: /);
  assert.ok((await pagina.locator('#provincias .producto').count()) >= 40); // 52 provincias con datos
  assert.deepEqual(errores, []);
  await contexto.close();
});

test('alquiler: cuánto te pueden subir', async () => {
  const { pagina, errores, contexto } = await abrir('alquiler/');
  assert.deepEqual(errores, []);
  assert.match(await pagina.textContent('#titular'), /^Si te suben el alquiler en \p{L}+, como mucho un .+ %\.$/u);
  await pagina.fill('#renta', '1.000');
  assert.match(await pagina.textContent('#resultado'), /^(Te pueden subir como mucho .+ al mes: de 1\.?000,00\s€ a .+\s€\.|Ese mes no te pueden subir el alquiler\.)$/);
  await pagina.check('input[name=firma][value="antiguo"]');
  assert.match(await pagina.textContent('#resultado-detalle'), /IPC/);
  assert.equal(await pagina.locator('#historia polyline').count(), 2);
  await accesible(pagina);
  await contexto.close();
});

test('ahorro: Letras del Tesoro', async () => {
  const { pagina, errores, contexto } = await abrir('ahorro/');
  assert.deepEqual(errores, []);
  assert.match(await pagina.textContent('#titular'), /^Las Letras del Tesoro a 12 meses pagan un .+ %\.$/);
  await pagina.fill('#cantidad', '5.000');
  assert.match(await pagina.textContent('#resultado'), /^En 12 meses ganarías .+\s€: unos .+\s€ después de Hacienda\.$/);
  assert.ok((await pagina.locator('#plazos .producto').count()) >= 4);
  await accesible(pagina);
  await contexto.close();
});

test('fuentes y ficheros de la app', async () => {
  const { pagina, errores, contexto } = await abrir('fuentes/');
  assert.deepEqual(errores, []);
  await accesible(pagina);
  for (const f of ['manifest.webmanifest', 'sw.js', 'sitemap.xml', 'robots.txt', 'assets/img/compartir.png', 'assets/img/icono-512.png']) {
    const r = await pagina.request.get(base + f);
    assert.equal(r.status(), 200, f);
  }
  await contexto.close();
});

/* ---------- Versión en inglés ---------- */

// Palabras que delatan castellano sin traducir (no se miran direcciones ni nombres de gasolineras)
const CASTELLANO = /¿|¡|\b(de|del|los|las|que|con|para|más|hoy|mañana|precio|hipoteca|gasolina|cuota|años|ahora)\b/i;
async function textoEnCastellano(pagina) {
  return pagina.evaluate((patron) => {
    const re = new RegExp(patron, 'i');
    const fuera = 'script, style, .estacion, #mapa, .idiomas, option, select, #bloque-provincias, #leyenda-provincia';
    const malos = [];
    const recorrer = (n) => {
      if (n.nodeType === 3) {
        const t = n.textContent.trim();
        if (t && re.test(t) && !n.parentElement.closest(fuera) && n.parentElement.checkVisibility()) malos.push(t.slice(0, 80));
      } else n.childNodes.forEach(recorrer);
    };
    recorrer(document.body);
    return malos;
  }, CASTELLANO.source);
}

for (const [nombre, ruta] of Object.entries({ portada: 'en/', luz: 'en/luz/', gasolina: 'en/gasolina/', compra: 'en/compra/', alquiler: 'en/alquiler/', ahorro: 'en/ahorro/', hipoteca: 'en/hipoteca/', inflación: 'en/ipc/', fuentes: 'en/fuentes/' })) {
  test(`inglés: ${nombre} sin errores, sin castellano y accesible`, async () => {
    const { pagina, errores, contexto } = await abrir(ruta);
    assert.deepEqual(errores, []);
    assert.equal(await pagina.getAttribute('html', 'lang'), 'en');
    assert.deepEqual(await textoEnCastellano(pagina), []);
    // El selector lleva a la misma página en castellano
    assert.equal(await pagina.getAttribute('.idiomas a', 'href'), `/${ruta.slice(3)}`);
    await accesible(pagina);
    await contexto.close();
  });
}

test('inglés: los cálculos salen en inglés', async () => {
  let { pagina, contexto } = await abrir('en/luz/');
  assert.match(await pagina.textContent('#titular'), /cheapest|Right now/i);
  assert.match(await pagina.textContent('#t-plan'), /^When should I/);
  await contexto.close();

  ({ pagina, contexto } = await abrir('en/hipoteca/'));
  await pagina.fill('#diferencial', '0.75');
  assert.match(await pagina.textContent('#titular'), /payment/i);
  assert.match(await pagina.textContent('#entradilla'), /Euribor .* a month\.$/);
  await contexto.close();

  ({ pagina, contexto } = await abrir('en/ipc/'));
  await pagina.fill('#cantidad', '1,000');
  assert.match(await pagina.textContent('#resultado'), /^€1,000\.00 in .+ is worth €[\d,]+\.\d\d in /);
  await contexto.close();

  ({ pagina, contexto } = await abrir('en/compra/'));
  assert.match(await pagina.textContent('#titular'), /^Groceries cost .+ (more|less) today than a year ago\.$/);
  await pagina.fill('#gasto', '1,000');
  assert.match(await pagina.textContent('#resultado'), /^The same shop costs €[\d,]+\.\d\d today\.$/);
  await contexto.close();

  ({ pagina, contexto } = await abrir('en/gasolina/'));
  await pagina.fill('#cp', '28100');
  await pagina.click('button[type=submit]');
  await pagina.waitForSelector('.estacion', { timeout: 10000 });
  assert.match(await pagina.textContent('#titular'), /^(Cheapest within|No )/);
  assert.match(await pagina.textContent('.llegar'), /Directions/);
  await contexto.close();
});

test('el selector de idioma cambia de página con un clic', async () => {
  const { pagina, contexto } = await abrir('hipoteca/');
  await pagina.click('.idiomas a');
  await pagina.waitForURL(/\/en\/hipoteca\/$/);
  await pagina.click('.idiomas a');
  await pagina.waitForURL(/\/hipoteca\/$/);
  assert.equal(await pagina.getAttribute('html', 'lang'), 'es');
  await contexto.close();
});
