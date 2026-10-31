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
  // Compra
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
