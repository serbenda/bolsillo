// Genera los iconos de la app y la imagen para compartir (Open Graph) a partir del logo SVG.
// Lo ejecuta la Action con Playwright instalado; las imágenes no se guardan en el repositorio.
// Uso: node scripts/imagenes.mjs

import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const raiz = new URL('../', import.meta.url);
const logo = await readFile(new URL('assets/img/logo.svg', raiz), 'utf8');
let fuente = '';
try {
  // Usa la fuente de la web si ya está en vendor/ (la Action la descarga antes)
  const woff = await readFile(new URL('vendor/fuentes/archivo-latin-wdth-normal.woff2', raiz));
  fuente = `@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${woff.toString('base64')}) format('woff2');font-weight:100 900;font-stretch:62% 125%}`;
} catch {
  console.warn('Sin vendor/: la imagen para compartir usará la fuente del sistema');
}

const navegador = await chromium.launch();

async function captura(html, ancho, alto, destino) {
  const pagina = await navegador.newPage({ viewport: { width: ancho, height: alto } });
  await pagina.setContent(`<!doctype html><style>${fuente}*{margin:0;box-sizing:border-box}body{width:${ancho}px;height:${alto}px;overflow:hidden}</style>${html}`);
  await pagina.evaluate(() => document.fonts.ready);
  await writeFile(new URL(destino, raiz), await pagina.screenshot({ type: 'png' }));
  await pagina.close();
  console.log(`${destino} (${ancho}×${alto})`);
}

// Iconos: logo sobre el color de papel, con margen para iconos "maskable" de Android
const icono = (lado, margen) => `
  <div style="width:${lado}px;height:${lado}px;background:#eef1ee;display:grid;place-items:center">
    <div style="width:${lado * (1 - 2 * margen)}px">${logo}</div>
  </div>`;
await captura(icono(192, 0.12), 192, 192, 'assets/img/icono-192.png');
await captura(icono(512, 0.12), 512, 512, 'assets/img/icono-512.png');
await captura(icono(512, 0.2), 512, 512, 'assets/img/icono-maskable-512.png');
await captura(icono(180, 0.12), 180, 180, 'assets/img/apple-touch-icon.png');

// Imagen para compartir en WhatsApp, redes, etc. (una por idioma)
const compartir = (frase, pregunta1, pregunta2) => `<div style="width:1200px;height:630px;background:#eef1ee;color:#172033;font-family:Archivo,system-ui,sans-serif;padding:80px 90px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:28px">
      <div style="width:120px">${logo}</div>
      <div style="font-size:96px;font-weight:800;font-stretch:125%;letter-spacing:-0.03em">bolsillo</div>
    </div>
    <div style="font-size:58px;font-weight:800;font-stretch:112%;line-height:1.08;letter-spacing:-0.02em;max-width:980px">${frase}</div>
    <div style="display:flex;gap:18px;font-size:30px;font-weight:600">
      <span style="background:#c98e0c;color:#1a1405;padding:10px 22px;border-radius:12px">${pregunta1}</span>
      <span style="background:#b42318;color:#fff;padding:10px 22px;border-radius:12px">${pregunta2}</span>
    </div>
  </div>`;
await captura(compartir('Luz, gasolina, compra, alquiler, ahorro e hipoteca con datos oficiales.', '¿Cuándo pongo la lavadora?', '¿Dónde echo gasolina?'), 1200, 630, 'assets/img/compartir.png');
await captura(compartir('Electricity, fuel, groceries, rent, savings and mortgages in Spain, with official data.', 'When to run the washer?', 'Where to fill up?'), 1200, 630, 'assets/img/compartir-en.png');

await navegador.close();
