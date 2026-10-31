// «Avísame de la luz de mañana»: activa la sincronización periódica del service worker,
// que avisa cada tarde de la hora más barata del día siguiente.
// Solo existe en Chrome y Edge con la app instalada; en el resto de navegadores el bloque no se muestra.

import { tr, idioma } from './idioma.js';

const $ = (id) => document.getElementById(id);
const ETIQUETA = 'luz-manana';
const CACHE = 'bolsillo-avisos';

const compatible =
  'serviceWorker' in navigator && 'Notification' in window && 'caches' in window &&
  typeof ServiceWorkerRegistration !== 'undefined' && 'periodicSync' in ServiceWorkerRegistration.prototype;

async function ajustes() {
  const r = await (await caches.open(CACHE)).match('ajustes');
  return r ? r.json() : null;
}
const guardar = async (a) => (await caches.open(CACHE)).put('ajustes', new Response(JSON.stringify(a)));

function pintar(activos, mensaje = '') {
  $('avisos-boton').textContent = activos ? tr('Desactivar avisos', 'Turn off alerts') : tr('Activar avisos', 'Turn on alerts');
  $('avisos-boton').classList.toggle('secundario', activos);
  $('avisos-estado').textContent = mensaje || (activos ? tr('Avisos activados.', 'Alerts are on.') : '');
}

async function activar() {
  if ((await Notification.requestPermission()) !== 'granted') {
    pintar(false, tr('Sin permiso para mostrar notificaciones. Puedes darlo en los ajustes del navegador.', 'No permission to show notifications. You can allow it in your browser settings.'));
    return;
  }
  const registro = await navigator.serviceWorker.ready;
  const permiso = await navigator.permissions.query({ name: 'periodic-background-sync' }).catch(() => null);
  if (permiso?.state !== 'granted') {
    pintar(false, tr('Para recibir avisos, instala bolsillo como app (menú del navegador › Instalar) y actívalos desde ahí.', 'To get alerts, install bolsillo as an app (browser menu › Install) and turn them on from there.'));
    return;
  }
  await registro.periodicSync.register(ETIQUETA, { minInterval: 6 * 3600 * 1000 });
  await guardar({ luz: true, idioma });
  pintar(true);
}

async function desactivar() {
  const registro = await navigator.serviceWorker.ready;
  await registro.periodicSync.unregister(ETIQUETA).catch(() => {});
  await (await caches.open(CACHE)).delete('ajustes');
  pintar(false, tr('Avisos desactivados.', 'Alerts are off.'));
}

if (compatible && location.protocol === 'https:') {
  const activos = Boolean((await ajustes().catch(() => null))?.luz);
  $('bloque-avisos').hidden = false;
  pintar(activos);
  $('avisos-boton').addEventListener('click', async () => {
    $('avisos-boton').disabled = true;
    try {
      if ((await ajustes())?.luz) await desactivar();
      else await activar();
    } catch {
      pintar(false, tr('No se han podido activar los avisos en este navegador.', "Alerts couldn't be turned on in this browser."));
    } finally {
      $('avisos-boton').disabled = false;
    }
  });
}
