// Hace capturas de la web ya preparada (_site) con los datos del día y las guarda en _site/capturas/.
// El README las enlaza desde bendi.dev, así que siempre enseñan la versión publicada.
// Uso: node scripts/capturas.mjs   (necesita playwright)

import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { arrancar } from '../tests/e2e/servidor.mjs';

const destino = new URL('../_site/capturas/', import.meta.url);
await mkdir(destino, { recursive: true });

const servidor = await arrancar();
const navegador = await chromium.launch();

async function captura(nombre, ruta, { ancho = 1280, alto = 860, tema = 'light', antes, completa = false, ...opciones } = {}) {
  const contexto = await navegador.newContext({
    viewport: { width: ancho, height: alto },
    deviceScaleFactor: 2,
    colorScheme: tema,
    locale: 'es-ES',
    timezoneId: 'Europe/Madrid',
    reducedMotion: 'reduce',
    ...opciones,
  });
  const pagina = await contexto.newPage();
  // Sin visitas en las capturas
  await pagina.route(/goatcounter|gc\.zgo\.at/, (r) => r.abort());
  await pagina.goto(servidor.base + ruta, { waitUntil: 'networkidle' });
  if (antes) await antes(pagina);
  await pagina.waitForTimeout(800);
  await pagina.screenshot({ path: new URL(`${nombre}.png`, destino).pathname, fullPage: completa });
  await contexto.close();
  console.log(`capturas/${nombre}.png`);
}

await captura('portada', '');
await captura('luz', 'luz/', { completa: false, antes: (p) => p.evaluate(() => window.scrollTo(0, 0)) });
await captura('luz-por-que', 'luz/', {
  antes: (p) => p.locator('#bloque-porque').scrollIntoViewIfNeeded(),
});
await captura('gasolina', 'gasolina/', {
  antes: async (p) => {
    await p.fill('#cp', '28100');
    await p.click('button[type=submit]');
    await p.waitForSelector('.estacion', { timeout: 15000 });
    await p.waitForTimeout(2500); // teselas del mapa
  },
});
await captura('hipoteca', 'hipoteca/');
await captura('ipc', 'ipc/');
await captura('compra', 'compra/');
await captura('movil', '', { ancho: 390, alto: 844, tema: 'dark', isMobile: true, hasTouch: true });
await captura('movil-luz', 'luz/', { ancho: 390, alto: 844, tema: 'dark', isMobile: true, hasTouch: true });

await navegador.close();
await servidor.cerrar();
