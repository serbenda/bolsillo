// Genera la versión en inglés de la web (_site/en/…) a partir de las páginas en castellano de _site/.
// - Traduce el texto fijo con scripts/traducciones.mjs (lo que pintan los scripts lo traducen ellos al ver lang="en").
// - Ajusta rutas, idioma, URL canónica, etiquetas para compartir y el selector ES/EN.
// - Añade a todas las páginas los enlaces hreflang entre idiomas.
// - Falla si queda algún texto en castellano sin traducir, para que nunca se publique una página a medias.
// Uso: node scripts/ingles.mjs   (después de copiar la web a _site/)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { TRADUCCIONES, SIN_TRADUCIR } from './traducciones.mjs';

const SITIO = 'https://bolsillo.bendi.dev';
const raiz = new URL('../_site/', import.meta.url);
const PAGINAS = ['', 'luz/', 'gasolina/', 'compra/', 'alquiler/', 'hipoteca/', 'ahorro/', 'ipc/', 'fuentes/'];

const sinTraducir = [];
const traducir = (texto, donde) => {
  const limpio = texto.trim();
  if (!limpio || !/\p{L}/u.test(limpio)) return texto;
  if (Object.hasOwn(TRADUCCIONES, limpio)) return texto.replace(limpio, TRADUCCIONES[limpio]);
  if (!SIN_TRADUCIR.has(limpio)) sinTraducir.push(`${donde}: «${limpio}»`);
  return texto;
};

/** Traduce los nodos de texto, sin tocar <script> ni <style>. */
function traducirTexto(html, donde) {
  return html
    .split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/)
    .map((trozo, i) => (i % 2 ? trozo : trozo.replace(/>([^<]+)</g, (_, t) => `>${traducir(t, donde)}<`)))
    .join('');
}

/** Traduce los atributos que lee la gente o los lectores de pantalla, y las metaetiquetas de texto. */
function traducirAtributos(html, donde) {
  html = html.replace(/(\s(?:aria-label|title|placeholder|alt))="([^"]*)"/g, (m, a, v) => `${a}="${traducir(v, donde)}"`);
  return html.replace(
    /(<meta\s+(?:name="description"|property="og:(?:title|description)")\s+content=")([^"]*)(")/g,
    (_, a, v, b) => `${a}${traducir(v, donde)}${b}`
  );
}

const enlacesIdioma = (ruta) =>
  `  <link rel="alternate" hreflang="es" href="${SITIO}/${ruta}">\n` +
  `  <link rel="alternate" hreflang="en" href="${SITIO}/en/${ruta}">\n` +
  `  <link rel="alternate" hreflang="x-default" href="${SITIO}/${ruta}">\n`;

for (const ruta of PAGINAS) {
  const fichero = new URL(`${ruta}index.html`, raiz);
  const original = await readFile(fichero, 'utf8');
  const donde = `/en/${ruta}`;

  // Castellano: solo se añaden los enlaces hreflang
  const es = original.replace('</head>', `${enlacesIdioma(ruta)}</head>`);
  await writeFile(fichero, es);

  // Inglés
  let en = es
    .replace('<html lang="es">', '<html lang="en">')
    .replace('<meta property="og:locale" content="es_ES">', '<meta property="og:locale" content="en_GB">\n  <meta property="og:locale:alternate" content="es_ES">')
    .replaceAll(`href="${SITIO}/${ruta}">`, `href="${SITIO}/en/${ruta}">`) // canónica (los hreflang se rehacen abajo)
    .replace(`content="${SITIO}/${ruta}">`, `content="${SITIO}/en/${ruta}">`) // og:url
    .replace(`${SITIO}/assets/img/compartir.png`, `${SITIO}/assets/img/compartir-en.png`);
  // hreflang: la línea de castellano y x-default se han cambiado arriba; se vuelven a poner bien
  en = en.replace(/  <link rel="alternate" hreflang="es"[^\n]*\n  <link rel="alternate" hreflang="en"[^\n]*\n  <link rel="alternate" hreflang="x-default"[^\n]*\n/, enlacesIdioma(ruta));

  // Rutas a recursos compartidos: un nivel más arriba
  en = en.replace(/(\s(?:href|src))="((?:\.\.\/)*)((?:assets|vendor|data)\/[^"]*|manifest\.webmanifest)"/g, (_, a, sube, resto) => `${a}="../${sube}${resto}"`);

  // Selector de idioma: ahora el actual es EN
  en = en.replace(
    /<div class="idiomas"[\s\S]*?<\/div>/,
    `<div class="idiomas" role="group" aria-label="Idioma">\n      <a href="/${ruta}" hreflang="es" lang="es" title="Español">ES</a>\n      <span aria-current="true">EN</span>\n    </div>`
  );

  en = traducirAtributos(traducirTexto(en, donde), donde);
  // «Español» y lang="es" del enlace de vuelta se quedan en castellano a propósito
  sinTraducir.splice(0, sinTraducir.length, ...sinTraducir.filter((x) => !x.endsWith('«Español»')));

  const destino = new URL(`en/${ruta}`, raiz);
  await mkdir(destino, { recursive: true });
  await writeFile(new URL('index.html', destino), en);
  console.log(`en/${ruta}index.html`);
}

if (sinTraducir.length) {
  console.error(`Texto sin traducir (añádelo a scripts/traducciones.mjs):\n${sinTraducir.join('\n')}`);
  process.exit(1);
}
