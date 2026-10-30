// Service worker de bolsillo: la web funciona sin conexión con los últimos datos descargados.
// - Páginas y datos (data/*.json): primero la red; si no hay conexión, lo último guardado.
// - Estilos, scripts, fuentes e imágenes: lo guardado, y se actualiza en segundo plano.

const VERSION = 'bolsillo-v1';
const BASICOS = [
  './',
  'luz/',
  'gasolina/',
  'hipoteca/',
  'fuentes/',
  'assets/css/estilos.css',
  'assets/js/comun.js',
  'assets/js/datos-luz.js',
  'assets/js/ree.js',
  'assets/js/ventana.js',
  'assets/js/impuestos.js',
  'assets/js/luz.js',
  'assets/js/carburantes.js',
  'assets/js/gasolina.js',
  'assets/js/euribor.js',
  'assets/js/hipoteca.js',
  'assets/img/favicon.svg',
  'manifest.webmanifest',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => Promise.all(BASICOS.map((u) => c.add(u).catch(() => {})))).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function primeroRed(req) {
  const cache = await caches.open(VERSION);
  try {
    const r = await fetch(req);
    if (r.ok) cache.put(req, r.clone());
    return r;
  } catch {
    return (await cache.match(req, { ignoreSearch: true })) ?? Response.error();
  }
}

async function primeroCache(req, evento) {
  const cache = await caches.open(VERSION);
  const guardada = await cache.match(req);
  const nueva = fetch(req)
    .then((r) => { if (r.ok) cache.put(req, r.clone()); return r; })
    .catch(() => guardada);
  if (guardada) { evento.waitUntil(nueva); return guardada; }
  return nueva;
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // mapas y visitas: siempre a la red
  const datos = url.pathname.includes('/data/');
  const pagina = e.request.mode === 'navigate';
  e.respondWith(datos || pagina ? primeroRed(e.request) : primeroCache(e.request, e));
});
