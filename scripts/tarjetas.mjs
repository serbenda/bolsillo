// Imagen para compartir de cada sección con el dato del día («La luz más barata llega hoy a las 14:00»…).
// Abre cada página ya preparada en _site/, lee su titular y lo pinta en una tarjeta de 1200×630,
// que es lo que enseñan WhatsApp, Telegram o las redes al pegar el enlace.
// Si algo falla, la página se queda con la imagen genérica.
// Uso: node scripts/tarjetas.mjs   (después de preparar _site/, con Playwright instalado)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { arrancar } from '../tests/e2e/servidor.mjs';

const SITIO = 'https://bolsillo.bendi.dev';
const raiz = new URL('../_site/', import.meta.url);
// Sección → de dónde sale la frase (el titular, salvo en gasolina, que depende de tu búsqueda)
const SECCIONES = {
  'luz/': { color: '#c98e0c', es: 'Luz', en: 'Electricity' },
  'gasolina/': { color: '#b42318', es: 'Gasolina', en: 'Fuel', frase: '#provincias-frase' },
  'compra/': { color: '#2b59c3', es: 'Compra', en: 'Groceries' },
  'alquiler/': { color: '#7a4fbf', es: 'Alquiler', en: 'Rent' },
  'hipoteca/': { color: '#17784e', es: 'Hipoteca', en: 'Mortgage' },
  'ahorro/': { color: '#0f7c86', es: 'Ahorro', en: 'Savings' },
  'calefaccion/': { color: '#d9480f', es: 'Calefacción', en: 'Heating' },
  'ipc/': { color: '#172033', es: 'Inflación', en: 'Inflation' },
};

const logo = await readFile(new URL('../assets/img/logo.svg', import.meta.url), 'utf8');
let fuente = '';
try {
  const woff = await readFile(new URL('../vendor/fuentes/archivo-latin-wdth-normal.woff2', import.meta.url));
  fuente = `@font-face{font-family:Archivo;src:url(data:font/woff2;base64,${woff.toString('base64')}) format('woff2');font-weight:100 900;font-stretch:62% 125%}`;
} catch {}

const escapar = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const tarjeta = (seccion, frase, color, pie) => `<!doctype html><style>${fuente}*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;overflow:hidden}</style>
  <div style="width:1200px;height:630px;background:#eef1ee;color:#172033;font-family:Archivo,system-ui,sans-serif;padding:70px 90px;display:flex;flex-direction:column;justify-content:space-between;border-top:16px solid ${color}">
    <div style="display:flex;align-items:center;gap:22px">
      <div style="width:76px">${logo}</div>
      <div style="font-size:58px;font-weight:800;font-stretch:125%;letter-spacing:-0.03em">bolsillo</div>
      <span style="margin-left:auto;background:${color};color:#fff;font-size:30px;font-weight:700;padding:8px 22px;border-radius:12px">${escapar(seccion)}</span>
    </div>
    <div id="frase" style="font-weight:800;font-stretch:108%;line-height:1.08;letter-spacing:-0.02em;max-width:1020px">${escapar(frase)}</div>
    <div style="font-size:28px;font-weight:600;color:#586274">${escapar(pie)}</div>
  </div>`;

const servidor = await arrancar();
const navegador = await chromium.launch();
await mkdir(new URL('assets/img/og/', raiz), { recursive: true });
let hechas = 0;

for (const [ruta, s] of Object.entries(SECCIONES)) {
  for (const idioma of ['es', 'en']) {
    const camino = idioma === 'en' ? `en/${ruta}` : ruta;
    try {
      const pagina = await navegador.newPage({ locale: idioma === 'en' ? 'en-GB' : 'es-ES', timezoneId: 'Europe/Madrid' });
      await pagina.goto(servidor.base + camino);
      await pagina.waitForLoadState('networkidle');
      await pagina.waitForTimeout(500);
      let frase = (await pagina.textContent(s.frase ?? '#titular'))?.replace(/\s+/g, ' ').trim() ?? '';
      // Solo la primera frase: la tarjeta se lee de un vistazo
      frase = frase.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? frase;
      await pagina.close();
      if (frase.length < 10 || frase.includes('…')) throw new Error(`sin dato («${frase}»)`);

      const lienzo = await navegador.newPage({ viewport: { width: 1200, height: 630 } });
      await lienzo.setContent(tarjeta(s[idioma], frase, s.color, idioma === 'en' ? 'Official data · bolsillo.bendi.dev' : 'Datos oficiales · bolsillo.bendi.dev'));
      // Letra lo más grande posible sin pasar de cuatro líneas
      await lienzo.evaluate(() => {
        const el = document.getElementById('frase');
        for (let t = 84; t >= 44; t -= 2) { el.style.fontSize = `${t}px`; if (el.scrollHeight <= t * 1.08 * 4 + 2) break; }
        return document.fonts.ready;
      });
      const nombre = `${idioma}-${ruta.replace('/', '')}.png`;
      await writeFile(new URL(`assets/img/og/${nombre}`, raiz), await lienzo.screenshot({ type: 'png' }));
      await lienzo.close();

      // La página apunta a su tarjeta (con la versión del día para que no se quede la vieja en caché)
      const html = new URL(`${camino}index.html`, raiz);
      const version = new Date().toISOString().slice(0, 13).replace(/\D/g, '');
      const actual = await readFile(html, 'utf8');
      const nuevo = actual.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${SITIO}/assets/img/og/${nombre}?v=${version}$2`);
      if (nuevo === actual) throw new Error('sin og:image');
      await writeFile(html, nuevo);
      hechas++;
      console.log(`${nombre}: ${frase}`);
    } catch (e) {
      console.warn(`${camino}: se queda la imagen genérica (${e.message})`);
    }
  }
}

await navegador.close();
await servidor.cerrar();
console.log(`${hechas} tarjetas`);
