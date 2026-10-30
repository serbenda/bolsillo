# bolsillo

Precio de la luz hora a hora, gasolineras más baratas y simulador de hipoteca con datos públicos de España.

*Household costs in Spain (electricity, fuel, mortgage) built on official open data.*

## Secciones

| Sección | Pregunta | Fuente | Estado |
|---|---|---|---|
| [Luz](luz/) | ¿Cuándo pongo la lavadora? | [Red Eléctrica (REData)](https://www.ree.es/es/datos/apidatos) | Disponible |
| [Gasolina](gasolina/) | ¿Dónde echo gasolina? | [Ministerio para la Transición Ecológica](https://datos.gob.es/es/catalogo/e05068001-precio-de-carburantes-en-las-gasolineras-espanolas) | Disponible |
| Hipoteca | ¿Cuánto me sube la hipoteca? | Banco de España | En preparación |

## Cómo funciona

Es una web estática publicada en GitHub Pages. Una GitHub Action (`.github/workflows/publicar.yml`):

1. Pasa los tests.
2. Descarga el PVPC de hoy y de mañana de Red Eléctrica (`data/luz.json`) y los precios de todas las gasolineras del Ministerio, reducidos a lo necesario (`data/gasolina.json`).
3. Publica la web con esos datos.

Se ejecuta al hacer push a `main`, a mano desde la pestaña *Actions* y varias veces al día (incluida la tarde, cuando REE publica el precio de mañana). Los datos no se guardan en el repositorio: se generan en cada despliegue.

Si el fichero de la luz no tiene el día de hoy, la página intenta leer la API de REE directamente desde el navegador. La gasolina depende solo del fichero: la búsqueda es por ubicación o por código postal, y el mapa usa Leaflet con OpenStreetMap.

## Estructura

```
index.html            Portada
luz/                  Sección de la luz
gasolina/             Sección de la gasolina
hipoteca/             Próxima sección
assets/css/           Estilos comunes
assets/js/ree.js      Acceso a la API de REE (navegador y Node)
assets/js/ventana.js  Cálculo del tramo más barato
assets/js/carburantes.js  Datos del Ministerio: compactar, distancias, búsqueda
scripts/              Descarga de datos para la Action
tests/                Tests con node:test
```

## En local

Requiere Node 20 o superior, sin dependencias.

```bash
npm test        # tests
npm run datos   # descarga data/luz.json y data/gasolina.json
npm run dev     # sirve la web en local
```

## Publicación

En *Settings → Pages*, la fuente debe ser **GitHub Actions**.
