// Código común a todas las páginas: modo sin conexión y contador de visitas.

// Service worker: guarda la web y los últimos datos para consultarlos sin conexión.
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register(new URL('../../sw.js', import.meta.url), { scope: new URL('../../', import.meta.url).pathname })
    .catch(() => {});
}

// Visitas con GoatCounter: sin cookies ni datos personales. Solo en la web publicada.
if (location.hostname === 'bendi.dev') {
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = 'https://serbenda.goatcounter.com/count';
  document.head.append(s);
}
