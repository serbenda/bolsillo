// Páginas de gasolina por provincia (/gasolina/madrid/, /gasolina/las-palmas/…) para quien busca
// «gasolinera más barata en …» en Google. Se generan en cada publicación con los precios del momento,
// en HTML ya escrito (sin depender de JavaScript), y se añaden al sitemap.
// Uso: node scripts/provincias.mjs   (después de copiar la web a _site/)

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { expandir } from '../assets/js/carburantes.js';

const SITIO = 'https://bolsillo.bendi.dev';
const raiz = new URL('../_site/', import.meta.url);
const nombreProvincia = (n) => String(n ?? '').replace(/^(.+?)\s*\(([^)]+)\)$/, (_, nombre, art) => `${art.charAt(0).toUpperCase()}${art.slice(1).toLowerCase()} ${nombre}`);
const slug = (n) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const precio = (x) => x.toLocaleString('es-ES', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const titulo = (s) => esc(String(s).toLowerCase().replace(/(^|[\s(/-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase()));

const indice = JSON.parse(await readFile(new URL('data/gasolina/indice.json', raiz), 'utf8'));
const plantilla = await readFile(new URL('gasolina/index.html', raiz), 'utf8');
const fecha = indice.fecha ? new Date(indice.fecha).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Madrid' }) : '';

const provincias = Object.entries(indice.provincias ?? {})
  .map(([id, p]) => ({ id, nombre: nombreProvincia(p.nombre), medias: p.medias ?? {} }))
  .filter((p) => p.nombre)
  .map((p) => ({ ...p, ruta: slug(p.nombre) }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

// Cabecera y pie de la página de gasolina, un nivel más abajo
const cabecera = plantilla.slice(0, plantilla.indexOf('  <main'))
  .replace(/(href|src)="\.\.\//g, '$1="../../')
  .replace(/<a href="\.\/" aria-current="page">/, '<a href="../" aria-current="page">')
  .replace(/\s*<link rel="preload"[^>]*>/g, '')
  .replace(/\s*<link rel="alternate" hreflang[^>]*>/g, '')
  .replace(/\s*<link rel="stylesheet" href="[^"]*leaflet[^"]*">/g, '')
  .replace(/\s*<script[^>]*leaflet[^>]*><\/script>/g, '');
// Pie sencillo: apoyo y enlaces (sin el texto del mapa, que aquí no hay)
const piePlantilla = plantilla.slice(plantilla.indexOf('  <footer')).replace(/(href|src)="\.\.\//g, '$1="../../');
const apoyo = piePlantilla.match(/    <p class="apoyo">.*<\/p>\n/)?.[0] ?? '';
const enlaces = piePlantilla.match(/    <p><a href="\.\.\/\.\.\/fuentes\/">.*<\/p>\n/)?.[0] ?? '';
const pie = `  <footer class="envoltorio pie">\n${apoyo}${enlaces}  </footer>\n\n  <script type="module" src="../../assets/js/comun.js"></script>\n</body>\n</html>\n`;

const lista = (estaciones, c) => estaciones
  .filter((e) => typeof e[c] === 'number' && e[c] > 0)
  .sort((a, b) => a[c] - b[c])
  .slice(0, 10)
  .map((e) => `        <li><strong>${precio(e[c])} €/l</strong> <span>${titulo(e.rotulo)} · ${esc(e.direccion)}, ${titulo(e.municipio)}</span></li>`)
  .join('\n');

// Solo las provincias con gasolineras en los datos (para no enlazar páginas que no existen)
for (const p of provincias) {
  try { p.estaciones = expandir(JSON.parse(await readFile(new URL(`data/gasolina/${p.id}.json`, raiz), 'utf8'))); } catch { p.estaciones = []; }
}
const conDatos = provincias.filter((p) => p.estaciones.length);

const urls = [];
for (const p of conDatos) {
  const { estaciones } = p;
  const g95 = lista(estaciones, 'g95');
  const diesel = lista(estaciones, 'diesel');
  const medias = [
    typeof p.medias.g95 === 'number' ? `gasolina 95 a ${precio(p.medias.g95)} €/l` : '',
    typeof p.medias.diesel === 'number' ? `diésel a ${precio(p.medias.diesel)} €/l` : '',
  ].filter(Boolean).join(' y ');
  const desc = `Las gasolineras más baratas de ${p.nombre} hoy, con los precios oficiales del Ministerio. Media: ${medias}.`;
  const url = `${SITIO}/gasolina/${p.ruta}/`;

  const head = cabecera
    .replace(/<title>[^<]*<\/title>/, `<title>Gasolinera más barata en ${esc(p.nombre)} hoy · bolsillo</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(desc)}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1Gasolinera más barata en ${esc(p.nombre)} hoy"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace(/href="\/en\/gasolina\/"/, 'href="/en/gasolina/"');

  const otras = conDatos.filter((o) => o.id !== p.id).map((o) => `<a href="../${o.ruta}/">${esc(o.nombre)}</a>`).join(' · ');
  const main = `  <main class="envoltorio texto">
    <h1 class="titular">Gasolinera más barata en ${esc(p.nombre)} hoy</h1>
    <p class="entradilla">Precio medio en la provincia: ${esc(medias)}. Precios del Ministerio del ${esc(fecha)}.</p>
    <p><a class="boton" href="../">Buscar cerca de mi código postal</a></p>
${g95 ? `
    <section aria-labelledby="t-g95">
      <h2 id="t-g95">Gasolina 95: las 10 más baratas</h2>
      <ol class="lista-precios">
${g95}
      </ol>
    </section>
` : ''}${diesel ? `
    <section aria-labelledby="t-diesel">
      <h2 id="t-diesel">Diésel: las 10 más baratas</h2>
      <ol class="lista-precios">
${diesel}
      </ol>
    </section>
` : ''}
    <p class="nota">Precios de venta al público que cada gasolinera comunica al Ministerio para la Transición Ecológica. No incluye descuentos de tarjetas ni horarios: en <a href="../">la búsqueda por código postal</a> ves solo las abiertas ahora, en el mapa.</p>

    <section aria-labelledby="t-otras">
      <h2 id="t-otras">Otras provincias</h2>
      <p class="otras-provincias">${otras}</p>
    </section>
  </main>

`;
  await mkdir(new URL(`gasolina/${p.ruta}/`, raiz), { recursive: true });
  await writeFile(new URL(`gasolina/${p.ruta}/index.html`, raiz), head + main + pie);
  urls.push(url);
}

// Sitemap
const mapa = new URL('sitemap.xml', raiz);
const xml = await readFile(mapa, 'utf8');
await writeFile(mapa, xml.replace('</urlset>', `${urls.map((u) => `  <url><loc>${u}</loc><changefreq>daily</changefreq><priority>0.6</priority></url>`).join('\n')}\n</urlset>`));
console.log(`${urls.length} páginas de provincia`);
