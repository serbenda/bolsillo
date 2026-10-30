<p align="center"><img src="assets/img/logo.svg" width="96" alt=""></p>

# bolsillo

Precio de la luz hora a hora, gasolineras más baratas y simulador de hipoteca con datos públicos de España.

*Household costs in Spain (electricity, fuel, mortgage) built on official open data.*

## Secciones

| Sección | Pregunta | Fuente | Estado |
|---|---|---|---|
| [Luz](luz/) | ¿Cuándo pongo la lavadora? | [Red Eléctrica (REData)](https://www.ree.es/es/datos/apidatos) | Disponible |
| [Gasolina](gasolina/) | ¿Dónde echo gasolina? | [Ministerio para la Transición Ecológica](https://datos.gob.es/es/catalogo/e05068001-precio-de-carburantes-en-las-gasolineras-espanolas) | Disponible |
| [Hipoteca](hipoteca/) | ¿Cuánto me sube la hipoteca? | [Banco de España](https://www.bde.es/webbe/es/estadisticas/recursos/api-estadisticas-bde.html), serie `D_1NBAF472` | Disponible |

## Qué hace

- **Luz**: precio PVPC hora a hora de hoy y mañana, con o sin impuestos, la mejor hora para cada electrodoméstico y lo que cuesta ponerlo ahora o en el mejor momento.
- **Gasolina**: gasolineras más baratas y abiertas ahora cerca de ti, por ubicación o cualquier código postal, con mapa.
- **Hipoteca**: cuánto cambia la cuota con el último Euríbor, escenarios y su historia desde 1999.
- Funciona sin conexión con los últimos datos (se puede instalar como app), sin cookies ni anuncios.

## Cómo funciona

Es una web estática publicada en GitHub Pages en [bendi.dev/bolsillo](https://bendi.dev/bolsillo/). La GitHub Action (`.github/workflows/publicar.yml`):

1. Pasa los tests unitarios.
2. Recupera los datos ya publicados, para no perderlos si alguna fuente falla.
3. Descarga la luz de Red Eléctrica, las gasolineras del Ministerio (repartidas por provincia, para que el móvil solo baje la suya), el Euríbor del Banco de España y los códigos postales de GeoNames.
4. Descarga la fuente Archivo y Leaflet para servirlos desde la propia web, y genera los iconos y la imagen para compartir.
5. Pasa los tests de navegador y la auditoría de accesibilidad (Playwright y axe). Si fallan, no se publica.
6. Publica la web. En las PR solo construye y prueba.
7. Si falla una fuente, los tests o la publicación, abre un issue con la etiqueta `datos`; cuando se arregla, lo cierra.

Se ejecuta al fusionar en `main`, en cada PR, a mano desde *Actions* y varias veces al día. Los datos no se guardan en el repositorio. Las Actions están fijadas por commit.

## Estructura

```
index.html            Portada con el recibo del día
luz/                  Sección de la luz
gasolina/             Sección de la gasolina
hipoteca/             Simulador de hipoteca
fuentes/              Fuentes, privacidad y condiciones
sw.js                 Modo sin conexión
manifest.webmanifest  App instalable
assets/css/           Estilos comunes
assets/js/ree.js      Acceso a la API de REE (navegador y Node)
assets/js/ventana.js  Cálculo del tramo más barato
assets/js/carburantes.js  Datos del Ministerio: compactar, distancias, búsqueda
assets/js/euribor.js  Euríbor del Banco de España y cálculo de cuotas
assets/js/impuestos.js  Impuestos de la luz y consumos de cada aparato
assets/img/           Logo y favicon (los PNG se generan en la Action)
scripts/              Descarga de datos para la Action
tests/                Tests unitarios (node:test) y de navegador (tests/e2e)
```

## En local

Requiere Node 20 o superior, sin dependencias.

```bash
npm test        # tests
npm run datos   # descarga data/luz.json, data/gasolina.json y data/euribor.json
npm run dev     # sirve la web en local
```

En local, sin `vendor/`, la web usa la fuente del sistema y no muestra el mapa. Para tenerlo todo y pasar los tests de navegador:

```bash
npm run herramientas && npx playwright install chromium
node scripts/vendor.mjs && node scripts/imagenes.mjs
# copia la web a _site/ como en la Action y luego:
npm run e2e
```

Si cambia la fiscalidad de la luz (IVA o impuesto eléctrico), se actualiza en `assets/js/impuestos.js`.

## Publicación

En *Settings → Pages*, la fuente debe ser **GitHub Actions**.

## Licencia

Código bajo [licencia MIT](LICENSE). Los datos son de sus fuentes (ver [Fuentes y condiciones](https://bendi.dev/bolsillo/fuentes/)).
