// Service worker de bolsillo: la web funciona sin conexión con los últimos datos descargados.
// - Páginas, estilos, scripts y datos: primero la red (así nunca se mezclan versiones);
//   si no hay conexión, lo último guardado.
// - Fuente, mapa e imágenes, que casi nunca cambian: lo guardado, y se actualiza en segundo plano.

const VERSION = 'bolsillo-v6';
const BASICOS = [
  './',
  'luz/',
  'gasolina/',
  'compra/',
  'alquiler/',
  'ahorro/',
  'hipoteca/',
  'ipc/',
  'fuentes/',
  'en/',
  'en/luz/',
  'en/gasolina/',
  'en/compra/',
  'en/alquiler/',
  'en/ahorro/',
  'en/hipoteca/',
  'en/ipc/',
  'en/fuentes/',
  'assets/css/estilos.css',
  'assets/js/comun.js',
  'assets/js/idioma.js',
  'assets/js/portada.js',
  'assets/js/datos-luz.js',
  'assets/js/ree.js',
  'assets/js/ventana.js',
  'assets/js/impuestos.js',
  'assets/js/luz.js',
  'assets/js/carburantes.js',
  'assets/js/gasolina.js',
  'assets/js/euribor.js',
  'assets/js/hipoteca.js',
  'assets/js/generacion.js',
  'assets/js/luz-generacion.js',
  'assets/js/ipc.js',
  'assets/js/ipc-pagina.js',
  'assets/js/compra.js',
  'assets/js/compra-pagina.js',
  'assets/js/compartir.js',
  'assets/js/alquiler.js',
  'assets/js/alquiler-pagina.js',
  'assets/js/ahorro.js',
  'assets/js/ahorro-pagina.js',
  'assets/js/grafico-lineas.js',
  'assets/js/avisos.js',
  'assets/js/aviso-luz.js',
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
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION && k !== 'bolsillo-avisos').map((k) => caches.delete(k))))
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
  const estable = url.pathname.includes('/vendor/') || url.pathname.includes('/assets/img/');
  e.respondWith(estable ? primeroCache(e.request, e) : primeroRed(e.request));
});

// Avisos: con la app instalada, el navegador despierta al service worker cada pocas horas
// (sincronización periódica). Si ya están los precios de mañana, avisa una vez de la hora más barata.
importScripts('assets/js/aviso-luz.js');
const AVISOS = 'bolsillo-avisos';

async function ajustesAvisos() {
  const r = await (await caches.open(AVISOS)).match('ajustes');
  return r ? r.json() : null;
}

async function avisarLuz() {
  const ajustes = await ajustesAvisos();
  if (!ajustes?.luz) return;
  const manana = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(new Date(Date.now() + 86400000));
  if (ajustes.ultimo === manana) return; // ya avisado
  const r = await fetch('data/luz.json', { cache: 'no-cache' });
  if (!r.ok) return;
  const texto = self.avisoLuz(await r.json(), manana, ajustes.idioma);
  if (!texto) return;
  await self.registration.showNotification(texto.titulo, {
    body: texto.cuerpo,
    icon: 'assets/img/icono-192.png',
    badge: 'assets/img/icono-192.png',
    tag: 'luz-manana',
    data: { url: ajustes.idioma === 'en' ? 'en/luz/' : 'luz/' },
  });
  await (await caches.open(AVISOS)).put('ajustes', new Response(JSON.stringify({ ...ajustes, ultimo: manana })));
}

self.addEventListener('periodicsync', (e) => {
  if (e.tag === 'luz-manana') e.waitUntil(avisarLuz().catch(() => {}));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow(new URL(e.notification.data?.url ?? './', self.registration.scope).href));
});
