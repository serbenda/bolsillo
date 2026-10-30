// Servidor estático mínimo que imita GitHub Pages: sirve _site/ bajo /bolsillo/.
// Lo usan los tests de navegador, las capturas y Lighthouse.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml', '.txt': 'text/plain',
};

export async function arrancar(raiz = new URL('../../_site/', import.meta.url).pathname) {
  const servidor = createServer(async (req, res) => {
    const pedido = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (!pedido.startsWith('/bolsillo')) {
      res.writeHead(302, { Location: '/bolsillo/' }).end();
      return;
    }
    let ruta = normalize(join(raiz, pedido.replace(/^\/bolsillo/, '')));
    if (!ruta.startsWith(normalize(raiz))) { res.writeHead(403).end(); return; }
    try {
      if ((await stat(ruta)).isDirectory()) ruta = join(ruta, 'index.html');
      res.writeHead(200, { 'Content-Type': TIPOS[extname(ruta)] ?? 'application/octet-stream', 'Cache-Control': 'max-age=600' });
      res.end(await readFile(ruta));
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('no encontrado');
    }
  });
  await new Promise((ok) => servidor.listen(0, '127.0.0.1', ok));
  return {
    base: `http://127.0.0.1:${servidor.address().port}/bolsillo/`,
    cerrar: () => new Promise((ok) => servidor.close(ok)),
  };
}
