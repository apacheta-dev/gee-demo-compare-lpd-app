

var labels = {
    lblTitle: [
    "LPD Maps Comparison Tool for Haiti"  ,  
    "Herramienta para la Comparación de Mapas de DPT en Haiti"],

    lblLevel0: ["Adm. Level 0", "Nivel Adm. 0"],
    lblLevel1: ["Adm. Level 1", "Nivel Adm. 1"],

    lblNoData: ["No data", "Sin datos"],
    lblDeclining: ["Declining", "Disminución"],
    lblEarlySignDecline: ["Moderate decline", "Deterioro Moderado"],
    lblStableButStressed: ["Stable but stressed", "Estable pero Estresado"],
    lblStable: ["Stable", "Estable"],
    lblIncreasing: ["Increasing", "Aumento"],

    lblOpacity: ["Opacity", "Opacidad"],
    lblLPDLegend: ["LPD Legend'", "Leyenda DPT"],
    lblLPD: ["LPD", "DPT"],
   
    lblExpl1: [
        "This National LPD Comparison Tool, adapted from the Global App (*), supports countries in the 2026 UNCCD reporting process by enabling them to easily compare and select the models that best fit their local conditions (**).",
        "Esta Herramienta Nacional de Comparación de DPT, adaptada de la Aplicación Global (*), apoya a los países en el proceso de reporte a la UNCCD 2026 al permitirles comparar y seleccionar fácilmente los modelos que mejor se ajustan a sus condiciones locales (**)."
    ],

    lblClickLink1: [
        "Click here to open the UNCCD Good Practice Guidance Addendum for SDG Indicator 15.3.1",
        "Haga click aquí para abrir el Anexo de la Guía de Buenas Prácticas de la CNULD para el Indicador del ODS 15.3.1"
    ],

    lblClickLink2: [
        "Click here to explore how the FAO-WOCAT model can be parametrized",
        "Haga clic aquí para explorar cómo puede ser parametrizado el modelo FAO-WOCAT"
    ],

    lblClickLink3: [
        "Click here to explore how the MLS30m model can be parametrized",
        "Haga clic aquí para explorar cómo puede ser parametrizado el modelo MLS30m"
    ],

    lblAppDeveloped: ["For questions and feedback please contact: ", "Para mas información por favor contactar a:"],

    lblExplore: [
        "How to navigate this app:\n\
Explore and compare different global LPD maps by selecting them from the list of options available on the map.\n\n\
To get more information, select the layer you want to click on from the available layers list: \n\
   - If you choose 'Pixel Explorer' and click on the map, you will get a chart to inspect the NDVI profile at that point.\n\
   - If you select 'Adm. Level 1', you will get the LPD statistics for the AOI by clicking on the map.\n\n\
You can also select an AOI from the list. \n\n\
To return to the initial global overview, click on 'Whole Country'.",
        "Cómo navegar en esta aplicación:\n\
Explora y compara diferentes mapas globales de LPD seleccionándolos de la lista de opciones disponibles en el mapa.\n\n\
Para obtener más información, puedes seleccionar la capa sobre la que deseas hacer clic de la lista de capas disponibles:\n\
   - Si eliges 'Explorador de Pixel' y haces clic en el mapa, obtendrás un gráfico para inspeccionar el perfil NDVI en ese punto.\n\
   - Si seleccionas 'Nivel Adm. 1', obtendrás las estadísticas al hacer clic en el AOI en el mapa.\n\n\
También puedes seleccionar un AOI directamente del listado. \n\n\
Para volver a la vista general inicial del país, haz clic en 'País completo'."
    ],

    lblNone: ['None', 'Ninguna'],
    lblPixelExplorer: ['Pixel explorer', 'Explorador de pixel'],
    lblSelectedAOI: ["Selected area of interest", "Área de interés seleccionada"],
    lblLayers: ["Layers", "Capas"],
    lblSelectLevel1: ["Select Adm. Level 1", "Selecccionar Nivel Adm. 1"],
    lblSelectContainer: ["Whole country", "País completo"],

    lblCloseInfoPanel: ["Close Info Panel", "Cerrar el Panel de Información"],
    lblOpenInfoPanel: ["Open Info Panel", "Abrir el Panel de Información"],
    lblAOIMask: ["AOI Mask", "Máscara AOI"],

    lblEnterAssetId: [
        'Alternatively, if you want to calculate stats for a preloaded asset please enter the asset id and click on the button to load it from GEE. If the asset contains more than one feature, the geometries will be merged into one single feature.',
        'Opcionalmente, si desea calcular indicadores para un asset ya disponible en GEE ingrese el id de dicho asset y haga click en el botón "Cargar" para procesarlo. Si el asset contiene más de una feature se combinarán las geometrías en una única feature.'
    ],
    lblAssetId: ["GEE asset id", "Id de asset en GEE"],
    lblLoadAsset: ["Load", "Cargar"],
    lblCustomAsset: ["Custom GEE asset", "Asset propio en GEE"],

    lblInvalidAssetId: ["Invalid GEE asset id", "Id de asset en GEE inválido"],
    lblProcessingCustomAsset: ["Processing asset...", "Procesando asset..."],

    lblTotalArea: ["Total Area (ha): ", "Área total (ha): "],
    lblArea: ["Area (ha)", "Área (ha)"],
    lblName: ["Name: ", "Nombre: "],
    lblLatitude: ["Lat.", "Lat."],
    lblLongitude: ["Lon.", "Lon."],
    lblGo: ["Go", "Ir"],

    lblUserLocation: ['User location', 'Localización de usuario'],
    lblRemoveLocation: ['Hide marker', 'Ocultar punto'],

    lblSelectPoint: ["Select a point", "Seleccione un punto"],
    lblSelectedPoint: ["Selected point: ", "Punto seleccionado: "],

    lblNDVIProfile: ["NDVI profile ", "Perfil NDVI"],
    lblNDVIAnnualMeanAtPoint: ["NDVI x 10000 - Annual Mean at the point", "NDVI x 10000 - Media Anual en el punto"],
    lblCalendarYear: ["Calendar year", "Año calendario"],
    lblNDVIAnnualMean: ["NDVI x 10000 - Annual Mean", "NDVI x 10000 - Media Anual"],
    lblMonthlyNDVI: ["Monthly Mean NDVI MODIS (MOD13Q1)", "NDVI Media Mensual MODIS(MOD13Q1)"],

    lblPeriod: ["Period", "Período"],
    lblDecliningSummary: [
        "Summary Table by Period: Declining %  +  Moderate decline % by Product ",
        "Tabla Resumen por Período: % Disminución + % Deterioro moderado según cada Producto"
    ],
    lblCompleteStatistics: [
        "Complete area statistics (ha) by product, period, and LPD category",
        "Estadísticas completas de área (ha) por producto, período y categoría de LPD"
    ],
    
    lblLPDStatistics: ["LPD Statistics'", "Estadísticas de DPT"],
    
    lblProcessingArea: ["Processing area, please wait...", "Procesando el área, por favor espere..."],
    lblProcessing: ["Processing...", "Procesando..."],

    lblLocNotSupported: ['Device geolocalization is not not supported for this browser/OS.', 'La geolocalización del dispositivo no está disponible para el navegador/SO'],
    lblPermissionDenied: ['User denied the request for Geolocation.', 'El usuario denegó permisos para geolocalizar el dispositivo.'],
    lblPositionUnavailable: ['Location information is unavailable.', 'La información de localización no está disponible.'],
    lblTimeout: ['The request to get user location timed out.', 'Finalizó el tiempo disponible para obtener la localización del usuario.'],
    lblUnknownError: ['An unknown error occurred.', 'Ha ocurrido un error inesperado.'],

    lblGeometryNotContained: ["Geometry has to be contained in country area.", "La geometría tiene que estar contenida en el área del país."],
    lblSmallerArea: ["Please select area smaller than", "Seleccione un área más pequeña que"],
    lblSelectedAreaHa: ["Selected area:", "Área selecionada:"],

    lblLayerSelected: ["Please verify that you have selected the layer you want to inspect.", "Por favor, verifica que hayas seleccionado la capa que deseas inspeccionar."],

    lblExpl2: [
        "Choose an AOI from the list below or click on the 'Select whole country' button to get statistics.",
        "Elija un AOI del listado de abajo o haga click en el botón 'Seleccionar país completo' para obtener estadísticas."
    ],

    lblFlyTo: ['Coordinates Panel', 'Panel de Coordenadas'],
    lblFlyToText: [
        "Select a location from the list, click on the map or enter lat/lon and press 'Go' if you want to add a marker to the map. If you want to load the NDVI profile at the point make sure you have the 'Pixel Explorer' option selected.",
        "Seleccione un punto del listado, haga click en el mapa o ingrese lat/lon y presione 'Ir' si desea agregar un punto en el mapa. Si desea cargar el perfil de NDVI en el punto asegúrese de tener seleccionada la opción de 'Explorador de Pixel'."
    ],

    lblPoint: ["Point", "Point"],
    lblPointsForm: ["Points of interest form", "Formulario de puntos de interés"],
    
    lblDisclaimer: [
        "(*) https://apacheta.projects.earthengine.app/view/compare-lpd. (**) The boundaries, names, and designations (FAO, GAUL) used on maps in this app do not imply any opinion whatsoever from of Apacheta LLC or Apacheta Foundation regarding the legal status of any country, territory, city, or area, nor do they imply any opinion concerning the delimitation of frontiers and boundaries. \
         The mention of specific products, whether or not these have been patented, does not imply endorsement or recommendation by Apacheta LLC, Apacheta Foundation or PISLM in preference to others of a similar nature that are not mentioned.",
        "(*) https://apacheta.projects.earthengine.app/view/compare-lpd. (**) Los límites, nombres y denominaciones (FAO, GAUL) utilizados en los mapas de esta aplicación no implican en modo alguno una opinión de Apacheta LLC o Apacheta Foundation respecto al estatus legal de ningún país, territorio, ciudad o área, ni tampoco implican una opinión sobre la delimitación de fronteras o límites. \
          La mención de productos específicos, hayan sido o no patentados, no implica respaldo ni recomendación por parte de Apacheta LLC, Apacheta Foundation o PISLM en preferencia a otros de naturaleza similar que no se mencionan.",
      
    ],
   
    lblUserManual: ["App User Manual","Manual de Usuario de la Herramienta"],
   
};

var languages = ["English", "Spanish"];

var getLocLabels = function (lan) {
    var loc = {};
    var index = languages.indexOf(lan);
    Object.keys(labels).forEach(function (key) {
        loc[key] = labels[key][index];
    });
    return loc;
};

exports.getLocLabels = getLocLabels;
