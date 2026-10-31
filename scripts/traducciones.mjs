// Traducciones al inglés del texto fijo de las páginas (el que generan los scripts está en cada script).
// Cada clave es un texto exacto del HTML en castellano (un nodo de texto o un atributo).
// scripts/ingles.mjs falla si en una página queda texto en castellano sin traducir.

export const TRADUCCIONES = {
  // Comunes
  'bolsillo, inicio': 'bolsillo, home',
  Secciones: 'Sections',
  Idioma: 'Language',
  Luz: 'Electricity',
  Gasolina: 'Fuel',
  Hipoteca: 'Mortgage',
  Inflación: 'Inflation',
  '¿Te ahorra dinero? Apoya bolsillo en GitHub Sponsors': 'Saving you money? Support bolsillo on GitHub Sponsors',
  'Fuentes y condiciones': 'Sources and terms',
  'Web sin anuncios ni cookies.': 'No ads, no cookies.',
  '. Código en': '. Code on',
  'Web sin anuncios ni cookies. Código en': 'No ads, no cookies. Code on',

  // Portada
  'bolsillo · luz, gasolina e hipoteca con datos públicos': 'bolsillo · electricity, fuel and mortgage costs in Spain',
  'Precio de la luz hora a hora, gasolineras más baratas y simulador de hipoteca con datos públicos de España.':
    "Hourly electricity prices, the cheapest petrol stations and a mortgage calculator, using Spain's official open data.",
  'bolsillo: luz, gasolina e hipoteca con datos oficiales': 'bolsillo: electricity, fuel and mortgage costs in Spain',
  'Lo que cuesta el día a día, con datos oficiales.': 'What everyday life costs in Spain, with official data.',
  'Precios públicos de Red Eléctrica, el Ministerio, el Banco de España y el INE, puestos para responder a preguntas de casa.':
    'Public data from Red Eléctrica, the Ministry for the Ecological Transition, the Bank of Spain and INE, turned into answers to everyday questions.',
  'Tu recibo de hoy': "Today's receipt",
  'Luz ahora, con impuestos': 'Electricity now, incl. taxes',
  'Hora más barata': 'Cheapest hour',
  'Gasolina 95, media': '95 petrol, average',
  'Diésel, media': 'Diesel, average',
  'Euríbor a un año': '12-month Euribor',
  'Inflación, último año': 'Inflation, past year',
  'Datos oficiales, actualizados cada día': 'Official data, updated daily',
  '¿Cuándo pongo la lavadora?': 'When should I run the washing machine?',
  'Precio de la luz hora a hora, hoy y mañana, y lo que cuesta cada aparato según cuándo lo pongas.':
    'Hourly electricity prices for today and tomorrow, and what each appliance costs depending on when you run it.',
  '¿Dónde echo gasolina?': 'Where should I fill up?',
  'Las gasolineras más baratas y abiertas cerca de ti, con precios del Ministerio actualizados varias veces al día.':
    "The cheapest open petrol stations near you, with the Ministry's prices updated several times a day.",
  '¿Cuánto me sube la hipoteca?': 'How much will my mortgage go up?',
  'Cuánto cambia tu cuota con el último Euríbor del Banco de España, con escenarios y su historia desde 1999.':
    "How your monthly payment changes with the Bank of Spain's latest Euribor, with scenarios and its history since 1999.",
  '¿Cuánto ha subido la vida?': 'How much have prices gone up?',
  'Cuánto valen hoy tus euros de otra fecha con el IPC oficial del INE, y la inflación mes a mes desde 2003.':
    "What your euros from another date are worth today, using INE's official CPI, plus monthly inflation since 2003.",

  // Luz
  'Precio de la luz hoy · bolsillo': "Today's electricity price in Spain · bolsillo",
  'Precio de la luz PVPC hora a hora, hoy y mañana, y la mejor hora para poner la lavadora, el lavavajillas o cargar el coche.':
    "Spain's PVPC electricity price hour by hour, today and tomorrow, and the best time to run the washing machine, the dishwasher or charge your car.",
  'Precio de la luz hoy y cuándo poner la lavadora': "Today's electricity price and when to run the washing machine",
  'Cargando el precio de la luz…': 'Loading the electricity price…',
  Ahora: 'Now',
  'Media de hoy': "Today's average",
  'Precios con impuestos (impuesto eléctrico e IVA)': 'Prices including taxes (electricity tax and VAT)',
  'No hemos podido cargar el precio de Red Eléctrica. Vuelve a intentarlo en unos minutos.':
    "We couldn't load the price from Red Eléctrica. Please try again in a few minutes.",
  'Hora a hora': 'Hour by hour',
  Día: 'Day',
  Hoy: 'Today',
  Mañana: 'Tomorrow',
  'El precio de mañana se publica hacia las 20:15.': "Tomorrow's price is published at around 20:15 (Spanish time).",
  'Más barata': 'Cheapest',
  Intermedia: 'Mid-range',
  'Más cara': 'Most expensive',
  'Ver todos los precios': 'See all prices',
  Hora: 'Hour',
  '¿Qué vas a poner?': 'What are you running?',
  'Lo que cuesta cada aparato': 'What each appliance costs',
  Aparato: 'Appliance',
  'Si lo pones ahora': 'If you start now',
  'En el mejor momento': 'At the best time',
  'Consumos típicos de un hogar medio. El tuyo depende del aparato y del programa.':
    'Typical consumption for an average household. Yours depends on the appliance and the programme.',
  '¿Por qué está cara o barata?': 'Why is it expensive or cheap?',
  Últimos: 'Last',
  'días, precio medio sin impuestos': 'days, average price before taxes',
  'Precio y renovables, día a día': 'Price and renewables, day by day',
  'Mucha renovable': 'High renewables',
  'Poca renovable': 'Low renewables',
  'Generación peninsular por tecnología publicada por Red Eléctrica. La altura de cada barra es el precio medio del día; el color, cuánta electricidad fue renovable.':
    "Mainland generation by technology, published by Red Eléctrica. Each bar's height is the day's average price; its colour, how much electricity was renewable.",
  'Precio PVPC de la península (tarifa 2.0TD) publicado por Red Eléctrica, con peajes y cargos. Con impuestos se le suman el impuesto eléctrico (':
    "PVPC price for mainland Spain (2.0TD tariff, Spain's regulated household rate) published by Red Eléctrica, including network tolls and charges. Including taxes adds the electricity tax (",
  ') y el IVA (': ') and VAT (',
  ') del término de energía; la factura añade además la potencia contratada y el alquiler del contador. Si tienes tarifa de mercado libre, tu precio es otro.':
    ') on the energy charge; your bill also adds the contracted power and meter rental. If you are on a free-market tariff, your price is different.',
  'Red Eléctrica solo publica en abierto el precio de la península. En Canarias, Ceuta y Melilla, además, los impuestos son otros (IGIC o IPSI en lugar de IVA).':
    'Red Eléctrica only publishes the mainland price as open data. In the Canary Islands, Ceuta and Melilla the taxes are also different (IGIC or IPSI instead of VAT).',

  // Gasolina
  'Gasolineras más baratas cerca de ti · bolsillo': 'Cheapest petrol stations near you in Spain · bolsillo',
  'Las gasolineras más baratas cerca de ti, con los precios oficiales del Ministerio para la Transición Ecológica.':
    "The cheapest petrol stations near you in Spain, with official prices from the Ministry for the Ecological Transition.",
  'Gasolineras más baratas y abiertas cerca de ti': 'Cheapest open petrol stations near you',
  'Busca por tu ubicación o por código postal y te ordenamos las gasolineras de más barata a más cara.':
    "Search by your location or a Spanish postcode and we'll sort the stations from cheapest to most expensive.",
  'Usar mi ubicación': 'Use my location',
  o: 'or',
  'Código postal': 'Postcode',
  Buscar: 'Search',
  Combustible: 'Fuel',
  Distancia: 'Distance',
  'Solo abiertas ahora': 'Open now only',
  '¿Echo hoy o espero?': 'Fill up today or wait?',
  'Evolución del precio medio': 'Average price trend',
  Resultados: 'Results',
  'Precios oficiales del Ministerio para la Transición Ecológica, solo gasolineras de venta al público. Comprueba el precio en el surtidor: puede haber cambiado desde la última actualización.':
    'Official prices from the Ministry for the Ecological Transition, public petrol stations only. Check the price at the pump: it may have changed since the last update.',
  'El mapa se descarga de OpenStreetMap solo cuando haces una búsqueda. Los códigos postales son de':
    'The map is only loaded from OpenStreetMap when you search. Postcodes come from',
  '(CC BY 4.0). «Abierta» sale del horario que declara cada gasolinera al Ministerio.':
    '(CC BY 4.0). “Open” is based on the opening hours each station reports to the Ministry.',

  // Hipoteca
  '¿Cuánto me sube la hipoteca? · bolsillo': 'How much will my mortgage go up? · bolsillo',
  'Calcula cuánto cambia tu cuota en la próxima revisión con el Euríbor a un año publicado por el Banco de España.':
    'Work out how your Spanish variable-rate mortgage payment changes at the next review, using the 12-month Euribor published by the Bank of Spain.',
  '¿Cuánto me sube la hipoteca con el Euríbor?': 'How much will the Euribor raise my mortgage?',
  'Pon los datos de tu hipoteca variable y te decimos cuánto cambia la cuota con el último Euríbor publicado.':
    "Enter your variable-rate mortgage details and we'll tell you how your payment changes with the latest Euribor.",
  'Tu hipoteca': 'Your mortgage',
  'Capital pendiente': 'Outstanding balance',
  'Años que quedan': 'Years remaining',
  años: 'years',
  Diferencial: 'Margin (spread)',
  'Euríbor de tu última revisión': 'Euribor at your last review',
  'Si no sabes el mes, mira el último recibo o la carta de revisión del banco: suele indicar el Euríbor aplicado.':
    "If you don't know the month, check your latest statement or the bank's review letter: it usually states the Euribor applied.",
  'Si el Euríbor cambia': 'If the Euribor changes',
  Euríbor: 'Euribor',
  'Cuota al mes': 'Monthly payment',
  'Frente a ahora': 'Versus now',
  '¿Y si amortizo?': 'What if I pay some off early?',
  'Dinero que adelantas': 'Amount you pay off',
  'Reducir cuota': 'Lower the payment',
  'Reducir plazo': 'Shorten the term',
  'Con el tipo actual sin cambios y sin contar la comisión por amortización que pueda cobrar tu banco.':
    'Assuming the current rate stays the same, and not counting any early repayment fee your bank may charge.',
  'El Euríbor desde 1999': 'The Euribor since 1999',
  'Euríbor a un año publicado por el Banco de España (serie D_1NBAF472). Cálculo orientativo con el sistema francés de amortización. Tu banco aplicará el índice que fije tu escritura, normalmente el publicado uno o dos meses antes de la revisión.':
    'The 12-month Euribor published by the Bank of Spain (series D_1NBAF472). An estimate using the standard French amortisation method. Your bank will apply the index set in your mortgage deed, usually the one published one or two months before the review.',

  // Inflación
  '¿Cuánto ha subido la vida? · bolsillo': 'How much have prices gone up in Spain? · bolsillo',
  'Calcula cuánto valen hoy tus euros de otra fecha con el IPC oficial del INE, y mira la inflación mes a mes desde 2003.':
    "Work out what your euros from another date are worth today with Spain's official CPI from INE, and see monthly inflation since 2003.",
  '¿Cuánto ha subido la vida? Calculadora del IPC': 'How much have prices gone up? Spain CPI calculator',
  'La vida cuesta hoy un': 'Living costs',
  'más que hace un año.': 'more today than a year ago.',
  'Dato del último mes publicado por el INE. Calcula cuánto valen hoy tus euros de otra fecha.':
    'Latest monthly figure published by INE. Work out what your euros from another date are worth today.',
  Calculadora: 'Calculator',
  Cantidad: 'Amount',
  De: 'From',
  A: 'To',
  'La inflación, mes a mes': 'Inflation, month by month',
  'Índice general nacional del IPC publicado por el INE (serie IPC290751, base 2025). La inflación interanual compara cada mes con el mismo mes del año anterior. El dato de cada mes se publica a mediados del mes siguiente.':
    "Spain's national all-items CPI published by INE (series IPC290751, base 2025). Annual inflation compares each month with the same month a year earlier. Each month's figure is published in the middle of the following month.",

  // Fuentes
  'Fuentes y condiciones · bolsillo': 'Sources and terms · bolsillo',
  'De dónde salen los datos de bolsillo, cómo se calculan y qué se hace con tus visitas.':
    "Where bolsillo's data comes from, how it is calculated and what happens with your visits.",
  'Fuentes y condiciones de bolsillo': 'bolsillo sources and terms',
  'Todos los datos son públicos y oficiales: Red Eléctrica, el Ministerio para la Transición Ecológica, el Banco de España y el INE. Aquí está de dónde sale cada uno y qué hacemos con ellos.':
    "All data is public and official: Red Eléctrica, the Ministry for the Ecological Transition, the Bank of Spain and INE. Here's where each piece comes from and what we do with it.",
  'Precio de la luz': 'Electricity price',
  'Precio voluntario para el pequeño consumidor (PVPC, tarifa 2.0TD) de la península, publicado por':
    "The Voluntary Price for Small Consumers (PVPC, 2.0TD tariff), Spain's regulated household electricity rate for the mainland, published by",
  'Red Eléctrica': 'Red Eléctrica',
  'en su API de datos abiertos. Incluye energía, peajes y cargos. El precio de mañana se publica hacia las 20:15.':
    "in its open data API. It includes energy, network tolls and charges. Tomorrow's price is published at around 20:15 Spanish time.",
  '«Con impuestos» suma al término de energía el impuesto especial sobre la electricidad y el IVA vigentes. La factura real añade el término de potencia, el alquiler del contador y, en su caso, el bono social. Los consumos de cada aparato son estimaciones típicas.':
    '“Including taxes” adds the current electricity tax and VAT to the energy charge. Your actual bill also includes the power charge, meter rental and, where applicable, the social discount. Appliance consumption figures are typical estimates.',
  'La generación por tecnología (solar, eólica, gas…) es la peninsular diaria que publica Red Eléctrica. La comparación de precios entre días con más y menos renovables parte los últimos 30 días por la mitad según su porcentaje renovable.':
    "Generation by technology (solar, wind, gas…) is Red Eléctrica's daily mainland figure. The price comparison between high- and low-renewable days splits the last 30 days in half by their renewable share.",
  Gasolineras: 'Petrol stations',
  'Precios de las estaciones de servicio de venta al público del': 'Prices of public petrol stations from the',
  'Ministerio para la Transición Ecológica y el Reto Demográfico': 'Ministry for the Ecological Transition and the Demographic Challenge',
  ', que las gasolineras están obligadas a comunicar. Se actualizan varias veces al día.':
    ', which stations are required to report. They are updated several times a day.',
  '«Abierta ahora» se calcula con el horario que cada gasolinera declara al Ministerio. Los códigos postales vienen de':
    '“Open now” is based on the opening hours each station reports to the Ministry. Postcodes come from',
  '(licencia': '(licence',
  ') y el mapa, de': ') and the map from',
  '«¿Echo hoy o espero?» usa un histórico propio: cada día se guarda el precio medio de cada combustible en cada provincia, y se compara el de hoy con la media de los siete días anteriores. El histórico empieza el 31 de octubre de 2026.':
    "“Fill up today or wait?” uses bolsillo's own history: every day the average price of each fuel in each province is saved, and today's is compared with the average of the previous seven days. The history starts on 31 October 2026.",
  'Euríbor a un año, índice oficial de referencia del mercado hipotecario, de la':
    "The 12-month Euribor, the official benchmark for Spain's mortgage market, from the",
  'API de estadísticas del Banco de España': "Bank of Spain's statistics API",
  '(serie D_1NBAF472). El simulador usa el sistema francés de amortización y es orientativo: tu banco aplica lo que diga tu escritura.':
    '(series D_1NBAF472). The calculator uses the French amortisation method and is an estimate: your bank applies whatever your mortgage deed says.',
  'Índice general nacional del': 'The national all-items',
  'IPC del INE': 'CPI from INE',
  '(serie IPC290751, base 2025, desde enero de 2002). Las equivalencias multiplican la cantidad por el cociente entre el índice de las dos fechas.':
    '(series IPC290751, base 2025, since January 2002). Equivalences multiply the amount by the ratio between the index on the two dates.',
  Privacidad: 'Privacy',
  'No hay cookies, anuncios ni cuentas. Las visitas se cuentan con': 'No cookies, ads or accounts. Visits are counted with',
  ', que no guarda datos personales. Tu ubicación, tu código postal, los datos de tu hipoteca y tus cálculos se quedan en tu navegador: no se envían a ningún sitio. El mapa descarga sus imágenes de OpenStreetMap solo cuando haces una búsqueda.':
    ", which stores no personal data. Your location, postcode, mortgage details and calculations stay in your browser: they're never sent anywhere. The map only loads its images from OpenStreetMap when you search.",
  'Apoyar el proyecto': 'Support the project',
  'bolsillo es gratis y seguirá siéndolo, sin anuncios. Si te ahorra dinero y quieres ayudar a mantenerlo, puedes apoyarlo en':
    "bolsillo is free and will stay free, with no ads. If it saves you money and you'd like to help keep it going, you can support it on",
  ', con una aportación puntual o mensual. Es totalmente voluntario y no cambia nada de lo que ves.':
    ', with a one-off or monthly contribution. It is entirely voluntary and changes nothing about what you see.',
  Derechos: 'Rights',
  '© 2026 Bendi. Todos los derechos reservados. El código se puede ver en': '© 2026 Bendi. All rights reserved. The code can be viewed on',
  ', pero no se puede copiar, modificar ni reutilizar sin permiso. Los datos pertenecen a sus fuentes y se reutilizan según sus condiciones. bolsillo no está vinculado a ninguno de estos organismos.':
    ', but may not be copied, modified or reused without permission. The data belongs to its sources and is reused under their terms. bolsillo is not affiliated with any of these organisations.',
  // Compartir
  Compartir: 'Share',
  'Avísame de la luz de mañana': "Alert me about tomorrow's electricity",
  'Cada tarde, en cuanto Red Eléctrica publique los precios, te avisamos de la hora más barata y la más cara del día siguiente. Funciona con bolsillo instalado como app en Chrome o Edge.':
    "Every evening, as soon as Red Eléctrica publishes the prices, we'll tell you the cheapest and most expensive hours for the next day. Works with bolsillo installed as an app in Chrome or Edge.",
  'Activar avisos': 'Turn on alerts',

  // Sueldo frente a la inflación
  '¿Tu sueldo ha subido más que los precios?': 'Has your salary kept up with prices?',
  'Lo que cobrabas al mes': 'What you earned a month',
  'En el año': 'In the year',
  'Lo que cobras hoy al mes': 'What you earn a month now',
  'Compara los precios medios de ese año con los de los últimos 12 meses publicados. Usa siempre el mismo tipo de sueldo (neto o bruto) en las dos casillas. Solo se guarda en tu navegador; no se envía a ningún sitio.':
    "Compares average prices in that year with the last 12 months published. Use the same kind of salary (net or gross) in both boxes. It's only saved in your browser and never sent anywhere.",
  // Gasolina por provincia
  'Tu provincia': 'Your province',
  'Media de España': "Spain's average",
  'Precio por provincia': 'Price by province',
  'Ver todas las provincias': 'See all provinces',
  'Precio medio de hoy en las gasolineras de cada provincia. La barra es la diferencia con la media de España: en rojo, más cara; en verde, más barata.':
    "Today's average price at the petrol stations in each province. The bar shows the difference from Spain's average: red is dearer, green is cheaper.",

  // ¿De dónde salen los datos? (luz, gasolina, hipoteca, inflación)
  "¿De dónde sale el precio?": "What's behind the price?",
  "Es el PVPC (precio voluntario para el pequeño consumidor), la tarifa regulada de la luz. Red Eléctrica publica cada tarde, hacia las 20:30, el precio de cada hora del día siguiente, y bolsillo lo descarga de su API pública.":
    "It's PVPC, Spain's regulated electricity tariff. Red Eléctrica publishes the price for each hour of the next day every evening at around 20:30, and bolsillo downloads it from their public API.",
  "¿Por qué cambia cada hora?": "Why does it change every hour?",
  "Porque sigue el precio del mercado mayorista, que se fija hora a hora según la demanda y cómo se produce la electricidad: con mucho sol y viento es más barata; cuando hacen falta centrales de gas, más cara. Por eso las horas centrales del día suelen ser las más baratas.":
    "Because it follows the wholesale market price, set hour by hour according to demand and how the electricity is generated: plenty of sun and wind make it cheaper; when gas power stations are needed, it gets dearer. That is why the middle of the day is often the cheapest.",
  "¿Qué incluye el precio con impuestos?": "What does the price with taxes include?",
  "El precio de la energía con peajes y cargos, más el impuesto eléctrico y el IVA. No incluye la parte fija de la factura: la potencia contratada y el alquiler del contador.":
    "The energy price including network charges, plus electricity tax and VAT. It doesn't include the fixed part of the bill: contracted power and meter rental.",
  "¿Y si no tengo PVPC?": "What if I'm not on PVPC?",
  "Si tienes una tarifa del mercado libre con precio fijo, pagas lo mismo a cualquier hora y estos precios no te afectan directamente. Tienes PVPC si tu factura dice «precio voluntario para el pequeño consumidor» y tu comercializadora es «de referencia».":
    "If you're on a fixed-price tariff from the free market, you pay the same at any hour and these prices don't affect you directly. You're on PVPC if your bill mentions PVPC and your supplier is one of the regulated 'reference suppliers'.",
  "¿De dónde salen los precios?": "Where do the prices come from?",
  "Del Ministerio para la Transición Ecológica: todas las gasolineras de España están obligadas a comunicarle sus precios. bolsillo descarga el listado completo varias veces al día.":
    "From Spain's Ministry for the Ecological Transition: every petrol station in Spain must report its prices to it. bolsillo downloads the full list several times a day.",
  "¿Por qué cambia tanto de una gasolinera a otra?": "Why do prices vary so much between stations?",
  "Casi la mitad del precio son impuestos iguales en todas (impuesto de hidrocarburos e IVA), pero cada gasolinera pone su margen. Influyen la marca, la competencia cercana, si es de autoservicio o si está en una autovía.":
    "Nearly half of the price is taxes that are the same everywhere (fuel duty and VAT), but each station sets its own margin. Brand, nearby competition, self-service and motorway locations all make a difference.",
  "¿Cómo funciona «¿Echo hoy o espero?»?": "How does \"Fill up today or wait?\" work?",
  "Compara el precio medio de hoy en tu provincia con la media de los siete días anteriores. bolsillo guarda esa media cada día desde finales de octubre de 2026, así que cuantos más días pasen, más útil será.":
    "It compares today's average price in your province with the average of the previous seven days. bolsillo has recorded that average every day since late October 2026, so it gets more useful over time.",
  "¿De dónde sale el Euríbor?": "Where does the Euribor come from?",
  "Lo calcula cada día el Instituto Europeo de los Mercados Monetarios. Para las hipotecas se usa la media de cada mes, que publica el Banco de España como índice oficial. bolsillo lo descarga de la API de estadísticas del Banco de España.":
    "It's calculated every day by the European Money Markets Institute. Mortgages use each month's average, which the Bank of Spain publishes as the official index. bolsillo downloads it from the Bank of Spain's statistics API.",
  "¿Cómo se calcula la cuota?": "How is the payment calculated?",
  "Con el sistema francés, el de casi todas las hipotecas en España: el tipo es el Euríbor más tu diferencial, y la cuota se mantiene igual hasta la siguiente revisión. Al principio pagas sobre todo intereses y, con los años, sobre todo capital.":
    "With the French amortisation system used by almost all Spanish mortgages: the rate is the Euribor plus your margin, and the payment stays the same until the next review. At first you mostly pay interest and, over the years, mostly capital.",
  "¿Cuándo me cambia la cuota?": "When does my payment change?",
  "En cada revisión, normalmente cada 6 o 12 meses, con el Euríbor publicado uno o dos meses antes. Tu escritura dice cada cuánto se revisa y qué mes se toma.":
    "At each review, usually every 6 or 12 months, using the Euribor published one or two months earlier. Your mortgage deed says how often it is reviewed and which month is used.",
  "¿De dónde sale la inflación?": "Where does the inflation figure come from?",
  "Del Índice de Precios de Consumo (IPC) del INE. Cada mes mide los precios de una cesta con cientos de productos y servicios que representan lo que gastan los hogares (comida, vivienda, transporte, ocio…), y cada cosa pesa según cuánto se gasta en ella. bolsillo descarga el índice general desde 2002 con la API pública del INE.":
    "From INE's Consumer Price Index (CPI). Every month it measures the prices of a basket of hundreds of goods and services that represent household spending (food, housing, transport, leisure…), each weighted by how much is spent on it. bolsillo downloads the headline index back to 2002 from INE's public API.",
  "¿Por qué no coincide con lo que noto?": "Why doesn't it match what I feel?",
  "Porque es una media de todos los hogares. Si gastas mucho en algo que ha subido más (el alquiler o la comida, por ejemplo), notarás más inflación que la oficial; si gastas en cosas que suben menos, notarás menos.":
    "Because it's an average across all households. If you spend a lot on something that has risen faster (rent or food, for example), you'll feel more inflation than the official figure; if your spending goes on things that rise less, you'll feel less.",
  "¿Cómo se calcula lo de mi sueldo?": "How is the salary comparison worked out?",
  "Se compara el IPC medio del año que eliges con el de los últimos 12 meses publicados. Si los precios han subido un 20 %, necesitas cobrar un 20 % más para comprar lo mismo; si tu sueldo ha subido menos, has perdido poder de compra.":
    "It compares the average CPI for the year you choose with the last 12 months published. If prices have risen 20%, you need to earn 20% more to buy the same things; if your salary has risen less, you've lost buying power.",

  // Calefacción
  "¿Cuánto cuesta la calefacción? Butano y gas · bolsillo": "How much does heating cost in Spain? Butane and gas · bolsillo",
  "Precio de la bombona de butano y de la tarifa regulada del gas natural (TUR) según el BOE, cuánto pagarías al año y qué sale más barato.": "The price of a butane cylinder and Spain's regulated natural gas tariff (TUR) according to the BOE, what you'd pay a year and which is cheaper.",
  "¿Cuánto cuesta la calefacción? Butano y gas hoy": "How much does heating cost? Butane and gas today",
  "La bombona de butano cuesta": "A butane cylinder costs",
  "Precio máximo con impuestos que fija el Gobierno en el BOE.": "Maximum price including taxes, set by the government in the BOE (official gazette).",
  "Bombona de butano": "Butane cylinder",
  "Gas natural con tarifa regulada (TUR)": "Natural gas on the regulated tariff (TUR)",
  "¿Para qué usas el gas?": "What do you use gas for?",
  "Agua caliente y cocina": "Hot water and cooking",
  "Calefacción en un piso": "Heating a flat",
  "Calefacción en una casa": "Heating a house",
  "Consumo al año (lo pone tu factura)": "Yearly use (it's on your bill)",
  "kWh": "kWh",
  "¿Qué sale más barato?": "Which is cheaper?",
  "Del BOE. El Gobierno fija cada dos meses el precio máximo de la bombona de butano de 12,5 kg y cada trimestre la tarifa de último recurso (TUR) del gas natural. Como no hay una API, bolsillo copia los precios del BOE y del Ministerio para la Transición Ecológica, y avisa cuando toca actualizarlos.": "From the BOE, Spain's official gazette. The government sets the maximum price of the 12.5 kg butane cylinder every two months and the natural gas last-resort tariff (TUR) every quarter. As there's no API, bolsillo copies the prices from the BOE and the Ministry for the Ecological Transition, and flags when they need updating.",
  "¿Qué es la TUR?": "What is the TUR?",
  "La tarifa regulada del gas natural, con precio fijado por el Gobierno. Pueden pedirla los hogares que consumen menos de 50.000 kWh al año, a una de las comercializadoras de último recurso. Suele ser de las más baratas, pero no todas las compañías la ofrecen: hay que pedirla expresamente.": "Spain's regulated natural gas tariff, with prices set by the government. Households using less than 50,000 kWh a year can ask for it from one of the last-resort suppliers. It's usually among the cheapest, but not every company offers it: you have to ask for it specifically.",
  "¿Qué incluye el coste del gas?": "What does the gas cost include?",
  "El término fijo, la energía que gastas, el impuesto especial sobre hidrocarburos y el IVA del 21 %. No incluye el alquiler del contador, que depende de tu instalación. Si el Gobierno vuelve a aplicar el IVA reducido del 10 %, pagarías algo menos.": "The fixed charge, the energy you use, the hydrocarbons excise duty and 21% VAT. It doesn't include meter rental, which depends on your installation. If the government brings back the reduced 10% VAT, you'd pay a bit less.",
  "¿Cómo se compara el butano con el gas?": "How does butane compare with gas?",
  "Por el precio de cada kWh de calor. Una bombona de 12,5 kg da unos 159 kWh. Es una comparación aproximada: también importa el rendimiento de la estufa o la caldera y lo que cuesta instalar cada sistema.": "By the price of each kWh of heat. A 12.5 kg cylinder gives about 159 kWh. It's a rough comparison: the efficiency of the heater or boiler and the cost of installing each system also matter.",
  "Precios máximos de la bombona de butano (Ministerio para la Transición Ecológica y BOE) y tarifa de último recurso del gas natural (BOE). Se actualizan a mano con cada resolución nueva.": "Maximum butane cylinder prices (Ministry for the Ecological Transition and BOE) and the natural gas last-resort tariff (BOE). They're updated by hand with each new resolution.",
  "¿Cuánto cuesta la calefacción?": "How much does heating cost?",
  "La bombona de butano y el gas natural con tarifa regulada: precio de hoy, lo que pagarías al año y qué sale más barato.": "Butane cylinders and natural gas on the regulated tariff: today's price, what you'd pay a year and which is cheaper.",
  "Calefacción": "Heating",
  // Quién hace bolsillo
  "Quién hace bolsillo": "Who makes bolsillo",
  "Quién hace bolsillo, por qué existe, cómo se mantiene sin anuncios y cómo puedes ayudar.": "Who makes bolsillo, why it exists, how it runs without ads and how you can help.",
  "Soy Bendi, ingeniero de sistemas y de nube, y hago bolsillo en mi tiempo libre.": "I'm Bendi, a systems and cloud engineer, and I make bolsillo in my spare time.",
  "Por qué existe": "Why it exists",
  "Los datos que responden a las preguntas de casa son públicos, pero están repartidos entre Red Eléctrica, el Ministerio, el Banco de España y el INE, en formatos pensados para especialistas. bolsillo los junta y los convierte en respuestas: cuándo poner la lavadora, dónde echar gasolina, cuánto te pueden subir el alquiler o cuánto rinden tus ahorros.": "The data that answers everyday household questions is public, but it's spread across Red Eléctrica, the Ministry, the Bank of Spain and INE, in formats meant for specialists. bolsillo brings it together and turns it into answers: when to run the washing machine, where to fill up, how much your rent can go up or what your savings earn.",
  "Cómo es bolsillo": "What bolsillo is like",
  "Sin anuncios": "No ads",
  "y sin vender nada.": " and nothing for sale.",
  "Sin cookies ni registro.": "No cookies or sign-up.",
  "Las visitas se cuentan de forma anónima, sin datos personales.": " Visits are counted anonymously, with no personal data.",
  "Solo datos oficiales": "Only official data",
  ", con la fuente de cada uno.": ", with the source of each one.",
  "Se actualiza sola": "It updates itself",
  "varias veces al día.": " several times a day.",
  "Gratis": "Free",
  ", y va a seguir siéndolo.": ", and it will stay that way.",
  "Cómo puedes ayudar": "How you can help",
  "Compártela": "Share it",
  "con quien eche gasolina, pague un alquiler o tenga hipoteca. Cada sección tiene un botón para compartir.": " with anyone who buys fuel, pays rent or has a mortgage. Every section has a share button.",
  "Cuéntame qué mejorarías": "Tell me what you would improve",
  "o si ves un dato raro, en las": " or if a figure looks odd, in the",
  "sugerencias del proyecto en GitHub": "project's suggestions on GitHub",
  "Apóyala con dinero": "Support it with money",
  ", si te ahorra algo: en": ", if it saves you something: on",
  ", con una aportación puntual o mensual.": ", with a one-off or monthly contribution.",
  "Con tu apoyo pago el dominio y, sobre todo, el tiempo para añadir secciones nuevas y mantener las que hay.": "Your support pays for the domain and, above all, the time to add new sections and keep the existing ones going.",
  // Tu bolsillo (portada)
  'Tu bolsillo hoy': 'Your money today',
  'Con lo que has escrito en cada sección. Solo se guarda en tu navegador.': "Based on what you've entered in each section. It's only saved in your browser.",
  // Alquiler y ahorro
  "Ahorro": "Savings",
  "Alquiler": "Rent",
  "El máximo que te pueden subir este año, en euros, con el índice oficial del INE.": "The most your rent can go up this year, in euros, using INE's official index.",
  "Letras a 12 meses": "12-month T-bills",
  "Lo que pagan hoy las Letras del Tesoro, lo que ganarías y lo que se come la inflación si lo dejas parado.": "What Spanish Treasury bills pay today, what you'd earn, and what inflation eats if your money sits idle.",
  "Subida máx. del alquiler": "Max. rent increase",
  "¿Cuánto me pueden subir el alquiler?": "How much can my rent go up?",
  "¿Cuánto rinden mis ahorros?": "How much do my savings earn?",
  "12 meses": "12 months",
  "3 meses": "3 months",
  "6 meses": "6 months",
  "9 meses": "9 months",
  "A los contratos de alquiler de vivienda firmados desde el 26 de mayo de 2023, sea el casero un particular o una empresa y esté o no la vivienda en una zona tensionada. Los contratos anteriores se actualizan con lo que diga el contrato, normalmente el IPC.": "Housing rental contracts signed since 26 May 2023, whether the landlord is an individual or a company and whether or not the home is in a high-pressure area. Older contracts are updated as the contract says, usually with CPI.",
  "Antes": "Before",
  "Con el índice oficial del INE para actualizar los alquileres de vivienda (IRAV).": "Using INE's official index for updating housing rents (IRAV).",
  "Cuánto pagan las Letras del Tesoro a 3, 6, 9 y 12 meses según la última subasta, cuánto ganarías con tus ahorros y cuánto se come la inflación.": "What Spanish 3, 6, 9 and 12-month Treasury bills pay at the latest auction, what you'd earn on your savings and how much inflation eats.",
  "Cuánto te pueden subir el alquiler este año, con el índice oficial del INE (IRAV) para contratos de vivienda, y cómo se calcula.": "How much your rent can go up this year in Spain, using INE's official index (IRAV) for housing contracts, and how it's worked out.",
  "Del Banco de España, que publica el tipo de interés de cada subasta de Letras (el tipo marginal, el más alto aceptado) y la rentabilidad diaria del bono a 10 años. bolsillo los descarga con la API de estadísticas del Banco de España. Esto es información, no una recomendación de inversión: bolsillo no es un asesor financiero.": "From the Bank of Spain, which publishes the rate at each bill auction (the marginal rate, the highest accepted) and the daily 10-year bond yield. bolsillo downloads them from the Bank of Spain's statistics API. This is information, not investment advice: bolsillo is not a financial adviser.",
  "Del INE, que publica el IRAV desde enero de 2025 con datos desde noviembre de 2024. bolsillo lo descarga con la API pública del INE y se actualiza automáticamente cada vez que sale un dato nuevo. Esto es información, no asesoramiento legal: ante cualquier duda, revisa tu contrato o consulta a la oficina de consumo o vivienda de tu comunidad.": "From INE, which has published the IRAV since January 2025 with data from November 2024. bolsillo downloads it from INE's public API and updates automatically whenever a new figure comes out. This is information, not legal advice: if in doubt, check your contract or ask your region's consumer or housing office.",
  "Desde el 26 de mayo de 2023": "From 26 May 2023",
  "El interés de las Letras, subasta a subasta": "Treasury bill rates, auction by auction",
  "El límite, mes a mes": "The cap, month by month",
  "El Índice de Referencia de Arrendamientos de Vivienda, creado por la Ley de Vivienda para evitar subidas desproporcionadas. Lo calcula el INE cada mes y es el menor de tres valores: la inflación (IPC), la inflación subyacente y una tasa media ajustada. Por eso suele ser más bajo que el IPC cuando los precios suben mucho.": "The Housing Rent Reference Index, created by Spain's Housing Act to prevent disproportionate increases. INE calculates it every month as the lowest of three values: inflation (CPI), core inflation and an adjusted average rate. That's why it's usually lower than CPI when prices rise a lot.",
  "El último publicado cuando toca actualizar la renta. El INE publica cada dato a mediados del mes siguiente, así que en una subida de enero se usa el de noviembre. Si tu subida es en un mes que aún no ha llegado, bolsillo usa el último dato y te avisa de que es una estimación.": "The latest one published when the rent is due to be updated. INE publishes each figure in the middle of the following month, so a January increase uses November's. If your increase is in a month that hasn't arrived yet, bolsillo uses the latest figure and tells you it's an estimate.",
  "En las subastas del Tesoro, que se hacen cada mes para cada plazo. Puedes comprarlas sin comisiones en la web del Tesoro Público (Tesoro Directo) o en el Banco de España, o a través de tu banco, que puede cobrar comisiones. Si necesitas el dinero antes de que venzan, tendrías que venderlas en el mercado al precio que haya ese día.": "At the Treasury's auctions, held every month for each term. You can buy them commission-free on the Spanish Treasury's website (Tesoro Directo) or at the Bank of Spain, or through your bank, which may charge fees. If you need the money before they mature, you'd have to sell them on the market at that day's price.",
  "Este año te pueden subir el alquiler como mucho un": "This year your rent can go up by at most",
  "Inflación (IPC)": "Inflation (CPI)",
  "Las Letras del Tesoro a 12 meses pagan un": "12-month Spanish Treasury bills pay",
  "Lo que ganas tributa en el IRPF como rendimiento del ahorro: un 19 % de los primeros 6.000 € de rendimientos del año, más en tramos superiores. Las Letras no tienen retención, así que lo pagas en la declaración de la renta. bolsillo descuenta un 19 % para darte una idea de lo que te queda.": "Your earnings are taxed as savings income: 19% on the first €6,000 of savings income each year, more above that. Treasury bills have no withholding, so you pay it in your tax return. bolsillo takes off 19% to give you an idea of what you keep.",
  "Lo que pagas al mes": "Your monthly rent",
  "Lo que quieres ahorrar": "Amount to save",
  "Lo que tienes que saber": "What you need to know",
  "Límite del alquiler (IRAV)": "Rent cap (IRAV)",
  "Mes en que te lo suben": "Month of the increase",
  "No. La Ley de Arrendamientos Urbanos solo permite actualizar la renta si el contrato lo dice expresamente. Y el IRAV es un máximo: tu casero puede subirte menos o no subirte nada.": "No. Spain's Urban Leases Act only allows the rent to be updated if the contract expressly says so. And the IRAV is a maximum: your landlord can raise it by less or not at all.",
  "Plazo": "Term",
  "Porque si los precios suben más que lo que te pagan, tu dinero compra menos aunque tengas más euros. Si lo dejas en una cuenta sin intereses, la inflación se lo va comiendo poco a poco.": "Because if prices rise faster than what you're paid, your money buys less even though you have more euros. Left in an account with no interest, inflation eats it away little by little.",
  "Tipo de interés de la última subasta del Tesoro, publicado por el Banco de España.": "Interest rate at the latest Treasury auction, published by the Bank of Spain.",
  "Tipo de interés de las subastas de Letras del Tesoro a 3, 6, 9 y 12 meses y rentabilidad del bono a 10 años, de la API de estadísticas del Banco de España. Es información, no una recomendación de inversión.": "Interest rate at the 3, 6, 9 and 12-month Treasury bill auctions and the 10-year bond yield, from the Bank of Spain's statistics API. This is information, not investment advice.",
  "Tipos de interés de las subastas de Letras del Tesoro y rentabilidad del bono a 10 años publicados por el Banco de España. La inflación es el IPC general del INE.": "Treasury bill auction rates and the 10-year bond yield published by the Bank of Spain. Inflation is INE's headline CPI.",
  "Un préstamo que haces al Estado a corto plazo: 3, 6, 9 o 12 meses. Cada Letra vale 1.000 € al vencer y se compra algo más barata; la diferencia es lo que ganas. Es de las inversiones más seguras que hay en España, porque la devuelve el Estado.": "A short-term loan you make to the Spanish state: 3, 6, 9 or 12 months. Each bill is worth €1,000 at maturity and you buy it for a bit less; the difference is what you earn. It's one of the safest investments in Spain, because the state pays it back.",
  "¿A qué contratos se aplica?": "Which contracts does it apply to?",
  "¿Cuándo firmaste el contrato?": "When did you sign the contract?",
  "¿Cuánto ganaría?": "How much would I earn?",
  "¿Cuánto me pueden subir el alquiler? · bolsillo": "How much can my rent go up in Spain? · bolsillo",
  "¿Cuánto me pueden subir?": "How much can it go up?",
  "¿Cuánto pago a Hacienda?": "How much tax do I pay?",
  "¿Cuánto rinden mis ahorros? Letras del Tesoro hoy": "How much do my savings earn? Spanish Treasury bills today",
  "¿Cuánto rinden mis ahorros? Letras del Tesoro · bolsillo": "How much do my savings earn? Spanish Treasury bills · bolsillo",
  "¿Cómo se compran?": "How do you buy them?",
  "¿Me lo pueden subir si mi contrato no dice nada?": "Can it go up if my contract says nothing?",
  "¿Por qué comparar con la inflación?": "Why compare with inflation?",
  "¿Qué es el IRAV?": "What is the IRAV?",
  "¿Qué es una Letra del Tesoro?": "What is a Treasury bill?",
  "¿Qué mes del índice se usa?": "Which month's figure is used?",
  "Índice de Referencia de Arrendamientos de Vivienda (IRAV) del INE, serie IRAV1 (variación anual, total nacional), desde noviembre de 2024. Es información, no asesoramiento legal.": "INE's Housing Rent Reference Index (IRAV), series IRAV1 (annual change, national total), since November 2024. This is information, not legal advice.",
  "Índice de Referencia de Arrendamientos de Vivienda (IRAV) publicado por el INE, variación anual. Para contratos firmados antes del 26 de mayo de 2023 se muestra el IPC general como referencia.": "Housing Rent Reference Index (IRAV) published by INE, annual change. For contracts signed before 26 May 2023, headline CPI is shown for reference.",
  "Última subasta de cada plazo": "Latest auction for each term",

  // Compra
  'Hace 10 años': '10 years ago',
  'Año a año': 'Year by year',
  Ver: 'Show',
  'Subida de cada año': 'Rise each year',
  'Lo que costaba': 'What it cost',
  'Lo que te cuesta hoy la compra': 'What your shop costs today',
  Producto: 'Product',
  'Toda la comida': 'All food',
  'Variación de precio de cada año, de diciembre a diciembre. El año en curso, desde diciembre hasta el último mes publicado.':
    'Price change each year, from December to December. The current year runs from December to the latest month published.',
  'Cómo leer estos datos': 'How to read these figures',
  '¿De dónde salen los datos?': 'Where does the data come from?',
  'Del Índice de Precios de Consumo (IPC) del': 'From the Consumer Price Index (CPI) published by',
  ', el mismo que se usa para medir la inflación oficial. Cada mes, el INE recoge los precios de los mismos productos en tiendas de toda España y calcula un índice para cada tipo de producto (las «rúbricas»): pan, huevos, aceite… bolsillo descarga esos índices desde 2002 con la API pública del INE y se actualizan automáticamente cada vez que sale un dato nuevo, a mediados de cada mes.':
    ", the same index used to measure official inflation. Every month INE collects the prices of the same products in shops across Spain and calculates an index for each type of product (the 'headings'): bread, eggs, oil… bolsillo downloads those indices back to 2002 from INE's public API and updates them automatically when a new figure comes out, in the middle of each month.",
  '¿Cómo se calcula lo que sube?': 'How is the rise calculated?',
  'Comparando el índice de dos meses. Si el índice de los huevos era 80 hace un año y hoy es 90, han subido un 12,5 % (90 ÷ 80 − 1). Lo que costaba cada año la compra de hoy se calcula igual: tu cantidad por el índice de diciembre de ese año, dividido por el índice de hoy. No son precios de una tienda, sino cuánto cambian los precios de media.':
    "By comparing the index for two months. If the egg index was 80 a year ago and is 90 today, eggs have gone up 12.5% (90 ÷ 80 − 1). What today's shop cost in each year is worked out the same way: your amount times that December's index, divided by today's index. These aren't prices in a shop, but how much prices change on average.",
  '¿Qué significa que algo sube un 10 %?': 'What does a 10% rise mean?',
  'Que lo que costaba 1 € cuesta ahora 1,10 €. Si baja un 10 %, cuesta 0,90 €. Los porcentajes no se suman: dos años seguidos al 10 % son un 21 %, no un 20 %.':
    "That what cost €1 now costs €1.10. If it falls 10%, it costs €0.90. Percentages don't add up: two years in a row at 10% make 21%, not 20%.",
  '¿Por qué no coincide con mi tique del súper?': "Why doesn't it match my supermarket receipt?",
  'El IPC es una media de toda España, de muchas tiendas, marcas y formatos. Tu compra depende de qué compras y dónde: si comes mucha fruta o huevos, la notarás más cara que la media; si compras marca blanca o en otra cadena, puede salirte más barata.':
    "CPI is an average for all of Spain, across many shops, brands and pack sizes. Your shop depends on what you buy and where: if you eat lots of fruit or eggs, it will feel pricier than average; if you buy own-brand or at another chain, it may come out cheaper.",
  '¿Por qué subió tanto la comida en 2022 y 2023?': 'Why did food go up so much in 2022 and 2023?',
  'Se encarecieron la energía, los fertilizantes, los piensos y el transporte tras la invasión rusa de Ucrania, y la sequía redujo cosechas como la del aceite de oliva. Entre 2023 y 2024 se rebajó el IVA de los alimentos básicos, lo que frenó algo los precios hasta que el IVA volvió a su nivel normal.':
    "Energy, fertiliser, animal feed and transport became more expensive after Russia's invasion of Ukraine, and drought cut harvests such as olive oil. In 2023 and 2024 VAT on basic foods was cut, which held prices back a little until VAT returned to its usual level.",
  '¿Qué es «Toda la comida»?': 'What is "All food"?',
  'El grupo de alimentos del IPC: todo lo que se come, de la carne al pan. No incluye las bebidas alcohólicas ni los productos de limpieza, que aparecen aparte en la lista.':
    "CPI's food group: everything you eat, from meat to bread. It doesn't include alcoholic drinks or cleaning products, which are listed separately.",
  'Rúbricas del': 'Price headings from',
  '(base 2025): el grupo de alimentos (serie IPC290811) y una veintena de productos, del pan a los productos de limpieza. Miden cómo cambian los precios en toda España; no hay datos oficiales de precios por supermercado.':
    "(base 2025): the food group (series IPC290811) and about twenty products, from bread to cleaning products. They measure how prices change across Spain; there's no official data on prices by supermarket.",
  Compra: 'Groceries',
  'bolsillo · luz, gasolina, compra e hipoteca con datos públicos': 'bolsillo · electricity, fuel, groceries and mortgage costs in Spain',
  'Precio de la luz hora a hora, gasolineras más baratas, lo que sube en el súper y simulador de hipoteca con datos públicos de España.':
    "Hourly electricity prices, the cheapest petrol stations, what's going up at the supermarket and a mortgage calculator, using Spain's official open data.",
  'Compra, último año': 'Groceries, past year',
  '¿Cuánto ha subido la compra?': 'How much have groceries gone up?',
  'Qué productos del súper suben y cuáles bajan, y cuánto cuesta hoy tu compra de hace un año, con el IPC del INE.':
    "Which supermarket products are going up and down, and what last year's shop costs today, using INE's CPI.",
  '¿Cuánto ha subido la compra? · bolsillo': 'How much have groceries gone up in Spain? · bolsillo',
  'Qué productos del súper suben y cuáles bajan (huevos, aceite, carne, fruta…) con el IPC oficial del INE, y cuánto cuesta hoy tu compra de hace un año.':
    "Which supermarket products are going up and down in Spain (eggs, oil, meat, fruit…) with INE's official CPI, and what last year's shop costs today.",
  '¿Cuánto ha subido la compra? Lo que sube y baja en el súper': "How much have groceries gone up? What's rising and falling at the supermarket",
  'La compra cuesta hoy un': 'Groceries cost',
  'Dato del último mes publicado por el INE. Mira qué productos suben, cuáles bajan y cuánto cuesta hoy tu compra.':
    "Latest monthly figure published by INE. See which products are going up and down, and what your shop costs today.",
  'Comparar con': 'Compare with',
  'Hace un mes': 'A month ago',
  'Hace un año': 'A year ago',
  'Hace 2 años': '2 years ago',
  'Hace 5 años': '5 years ago',
  'Tu compra': 'Your shop',
  'Lo que gastabas en la compra entonces': 'What you spent on groceries then',
  'Lo que ha subido y bajado en el último año': "What's gone up and down over the past year",
  'Variación del precio de cada tipo de producto en el periodo elegido. En rojo, lo que se ha encarecido; en verde, lo que se ha abaratado.':
    'Price change for each type of product over the chosen period. Red means it has gone up; green, that it has come down.',
  '¿Y en qué supermercado es más barato?': 'And which supermarket is cheapest?',
  'No hay datos oficiales de precios por supermercado: el INE mide cómo cambian los precios en toda España, no cuánto cuesta cada producto en cada cadena. Para comparar tiendas, estas webs independientes recogen los precios de los supermercados:':
    "There's no official data on prices by supermarket: INE measures how prices change across Spain, not what each product costs at each chain. To compare shops, these independent websites collect supermarket prices (in Spanish):",
  'OCU: supermercados más baratos de 2026': "OCU: Spain's cheapest supermarkets in 2026",
  'Estudio anual por cadena y ciudad': 'Annual study by chain and city',
  'POY': 'POY',
  'Compara la misma compra en una decena de supermercados': 'Compares the same shop across about ten supermarkets',
  'Supersupers': 'Supersupers',
  'Evolución diaria de precios en varias cadenas': 'Daily price changes at several chains',
  'bolsillo no está vinculado a ninguna de estas webs.': 'bolsillo is not affiliated with any of these websites.',
  'Índices de precios de consumo por producto (rúbricas del IPC, base 2025) publicados por el INE. Miden cómo cambian los precios de cada tipo de producto en toda España, no el precio en una tienda concreta. El dato de cada mes se publica a mediados del mes siguiente.':
    "Consumer price indices by product (CPI headings, base 2025) published by INE. They measure how prices for each type of product change across Spain, not the price in a particular shop. Each month's figure is published in the middle of the following month.",
};

/** Textos que no se traducen (nombres propios, unidades, números…). */
export const SIN_TRADUCIR = new Set([
  'bolsillo', 'ES', 'EN', 'English', 'GitHub', 'GitHub Sponsors', 'GeoNames', 'OpenStreetMap', 'GoatCounter', 'CC BY 4.0',
  '€', '%', '€/kWh', '—', '…', '.', '0,000 €/kWh', '0,000', '2 km', '5 km', '10 km', '25 km', '28100', 'INE',
]);
