// Botón «Compartir»: manda el titular de la página (tu cuota, tu compra, la hora más barata…)
// con una imagen lista para WhatsApp. Si el navegador no sabe compartir, copia el texto y el enlace.

import { tr } from './idioma.js';

const limpio = (el) => el?.textContent.replace(/\s+/g, ' ').trim() ?? '';

/** Parte un texto en líneas que caben en el ancho dado. */
function lineas(ctx, texto, ancho) {
  const salida = [];
  let actual = '';
  for (const palabra of texto.split(' ')) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (ctx.measureText(prueba).width > ancho && actual) {
      salida.push(actual);
      actual = palabra;
    } else actual = prueba;
  }
  if (actual) salida.push(actual);
  return salida;
}

/** Tarjeta de 1200×630 con el titular, para que se vea bien en WhatsApp, Telegram o redes. */
export async function imagen(titular, detalle) {
  await document.fonts?.ready;
  const c = document.createElement('canvas');
  c.width = 1200;
  c.height = 630;
  const ctx = c.getContext('2d');
  const fuente = getComputedStyle(document.body).fontFamily;
  ctx.fillStyle = '#eef1ee';
  ctx.fillRect(0, 0, 1200, 630);
  ctx.fillStyle = '#172033';
  ctx.fillRect(0, 0, 1200, 14);

  ctx.font = `800 40px ${fuente}`;
  ctx.fillText('bolsillo', 80, 110);

  let tam = 76;
  let t;
  do {
    ctx.font = `800 ${tam}px ${fuente}`;
    t = lineas(ctx, titular, 1040);
    tam -= 4;
  } while (t.length > 3 && tam > 40);
  tam += 4;
  let y = 170 + tam;
  for (const l of t) { ctx.fillText(l, 80, y); y += tam * 1.12; }

  // El detalle solo si cabe entero antes del pie
  if (detalle) {
    ctx.font = `400 30px ${fuente}`;
    const d = lineas(ctx, detalle, 1040);
    if (y + d.length * 40 < 540) {
      ctx.fillStyle = '#586274';
      for (const l of d) { y += 4; ctx.fillText(l, 80, y); y += 40; }
    }
  }

  ctx.fillStyle = '#586274';
  ctx.font = `600 28px ${fuente}`;
  ctx.fillText(tr('Datos oficiales · bolsillo.bendi.dev', 'Official data · bolsillo.bendi.dev'), 80, 580);
  return new Promise((ok) => c.toBlob(ok, 'image/png'));
}

async function compartir(boton) {
  const titular = limpio(document.getElementById('titular'));
  const detalle = limpio(document.getElementById('entradilla'));
  const url = location.href.split('#')[0];
  const texto = `${titular}\n${url}`;
  const titulo = document.title;

  if (navigator.share) {
    try {
      const blob = await imagen(titular, detalle);
      const fichero = blob && new File([blob], 'bolsillo.png', { type: 'image/png' });
      // Con imagen si se puede (móviles); si no, solo texto y enlace
      if (fichero && navigator.canShare?.({ files: [fichero] })) await navigator.share({ files: [fichero], text: texto, title: titulo });
      else await navigator.share({ title: titulo, text: titular, url });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return; // la persona ha cancelado
    }
  }
  try {
    await navigator.clipboard.writeText(texto);
    aviso(boton, tr('Copiado: pégalo donde quieras', 'Copied: paste it anywhere'));
  } catch {
    aviso(boton, tr('No se ha podido copiar', "Couldn't copy"));
  }
}

function aviso(boton, texto) {
  const estado = boton.parentElement.querySelector('.estado-compartir');
  estado.textContent = texto;
  clearTimeout(aviso.t);
  aviso.t = setTimeout(() => (estado.textContent = ''), 4000);
}

for (const boton of document.querySelectorAll('[data-compartir]')) {
  boton.addEventListener('click', () => compartir(boton));
}
