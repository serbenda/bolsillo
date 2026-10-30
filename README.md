# bolsillo

Precio de la luz hora a hora, gasolineras más baratas y simulador de hipoteca con datos públicos de España.

*Household costs in Spain (electricity, fuel, mortgage) built on official open data.*

## Secciones

| Sección | Pregunta | Fuente | Estado |
|---|---|---|---|
| [Luz](luz/) | ¿Cuándo pongo la lavadora? | [Red Eléctrica (REData)](https://www.ree.es/es/datos/apidatos) | Disponible |
| [Gasolina](gasolina/) | ¿Dónde echo gasolina? | [Ministerio para la Transición Ecológica](https://datos.gob.es/es/catalogo/e05068001-precio-de-carburantes-en-las-gasolineras-espanolas) | Disponible |
| [Hipoteca](hipoteca/) | ¿Cuánto me sube la hipoteca? | [Banco de España](https://www.bde.es/webbe/es/estadisticas/recursos/api-estadisticas-bde.html), serie `D_1NBAF472` | Disponible |

## Cómo funciona

Es una web estática publicada en GitHub Pages. Una GitHub Action (`.github/workflows/publicar.yml`):

1. Pasa los tests.
2. Recupera los datos ya publicados, para no perderlos si alguna fuente falla.
3. Descarga el PVPC de hoy y de mañana de Red Eléctrica (`data/luz.json`), los precios de todas las gasolineras del Ministerio, reducidos a lo necesario (`data/gasolina.json`), y la serie histórica del Euríbor a un año del Banco de España (`data/euribor.json`).
4. Descarga la fuente Archivo y Leaflet de npm a `vendor/`, para servirlos desde la propia web (sin Google Fonts ni CDN).
5. Publica la web.
6. Si alguna fuente ha fallado, abre un issue con la etiqueta `datos` (o comenta en el que ya está abierto). Cuando vuelve a funcionar, lo cierra.

Se ejecuta al hacer push a `main`, a mano desde la pestaña *Actions* y varias veces al día (incluida la tarde, cuando REE publica el precio de mañana). Los datos no se guardan en el repositorio: se generan en cada despliegue.

Si el fichero de la luz no tiene el día de hoy, la página intenta leer la API de REE directamente desde el navegador. La gasolina depende solo del fichero y avisa si los precios tienen más de 14 horas. La búsqueda es por ubicación o por código postal, y el mapa usa Leaflet con teselas de OpenStreetMap, que solo se descargan al buscar.

## Estructura

```
index.html            Portada
luz/                  Sección de la luz
gasolina/             Sección de la gasolina
hipoteca/             Simulador de hipoteca
assets/css/           Estilos comunes
assets/js/ree.js      Acceso a la API de REE (navegador y Node)
assets/js/ventana.js  Cálculo del tramo más barato
assets/js/carburantes.js  Datos del Ministerio: compactar, distancias, búsqueda
assets/js/euribor.js  Euríbor del Banco de España y cálculo de cuotas
scripts/              Descarga de datos para la Action
tests/                Tests con node:test
```

## En local

Requiere Node 20 o superior, sin dependencias.

```bash
npm test        # tests
npm run datos   # descarga data/luz.json, data/gasolina.json y data/euribor.json
npm run dev     # sirve la web en local
```

En local, sin `vendor/`, la web usa la fuente del sistema y no muestra el mapa. Para tenerlos:

```bash
npm install --no-save --no-package-lock leaflet@1.9.4 @fontsource-variable/archivo@5
node scripts/vendor.mjs
```

## Publicación

En *Settings → Pages*, la fuente debe ser **GitHub Actions**.
