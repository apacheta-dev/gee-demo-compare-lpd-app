/** 
 * App: Comparing LPD and Vegetation Trend Indicators 
 * 
 */

var ftc0 = ee.FeatureCollection("projects/apacheta-pislm/assets/UNCCD2026_HTI/LPD/HTI_LPD_Precal_Level0_v1");
var ftc1 = ee.FeatureCollection("projects/apacheta-pislm/assets/UNCCD2026_HTI/LPD/HTI_LPD_Precal_Level1_v1");

var mdlLegends = require('users/apacheta/lpd-demo:app-lpd/legends.js');
var mdlLocalization = require('users/apacheta/lpd-demo:app-lpd/localization.js');
var mdlPrecalculation = require('users/apacheta/lpd-demo:app-lpd/precalculation.js');

// Add coordinates for pointls you want to visualize in the points selector for quick localization
var demoPoints = {
    'Point 1': { lon: -72.49287, lat: 19.144502 },
};


/** NDVI datasets */
// Mixed LANDSAT NDVI
var countryName = 'Haiti';
var imgNDVILSMixed30m = ee.Image("projects/apacheta-lpd/assets/NDVI/MIXED/NDVI_MIXED_" + countryName + "_2000_2023_v1_GapFillSpatial");

// HiLPD
var imgNDVICBAS = ee.Image("projects/ee-ldn-global-ndvi1/assets/smallisland/ndvi_" + countryName + "_00_23_optimizeUNiint16");

// MODIS NDVI Collection - 2001/2023
var lstMonths = ee.List.sequence(1, 12);
var lstYears = ee.List.sequence(2001, 2023);

var imcMODIS = ee.ImageCollection('MODIS/061/MOD13Q1').filterDate('2001-01-01', '2023-12-31');

/** Create imc with month mean */
var imcByMonthYear = ee.ImageCollection.fromImages(
    lstYears.map(function (y) {
        return lstMonths.map(function (m) {
            return imcMODIS
                .select('NDVI')
                .filter(ee.Filter.calendarRange(y, y, 'year'))
                .filter(ee.Filter.calendarRange(m, m, 'month'))
                .mean()
                .set('system:time_start', ee.Date.fromYMD(y, m, 1))
                .rename('NDVI_Monthly_Mean');

        });
    }).flatten());

// Trends.Earth MODIS NDVI data set 
var imgNDVITE = ee.Image('users/geflanddegradation/toolbox_datasets/ndvi_modis_2001_2024');
imgNDVITE = imgNDVITE.select(imgNDVITE.bandNames().remove('y2024'));

/*
Get the NDVI Annual mean for every calendar Year and replace bad quality pixels with annual mean
*/
var imcByYear = ee.ImageCollection.fromImages(
    lstYears.map(function (y) {
        // Get the subset for the target year
        var modisYear = imcMODIS.filter(ee.Filter.calendarRange(y, y, 'year'));

        // Get the mean for NDVI
        var modisYearMean = modisYear.select('NDVI').mean();

        // Make a funtion to replace bad pixels with the mean
        var maskQAYear = function (image) {
            var image2 = image.select('NDVI');
            image2 = image2.where(image.select("SummaryQA").gte(2), modisYearMean);
            return image2.rename('NDVI');
        };

        var ModisYearCorrected = modisYear.map(maskQAYear);
        var ModisYearCorrmean = ModisYearCorrected.mean()
            .set('year', y)
            .set('system:time_start', ee.Date.fromYMD(y, 1, 1))
            .rename('NDVI_Annual_Mean');

        return ModisYearCorrmean;
    }));



///---------------------------------------------------------------

initApp('English');

function initApp(lan) {

    /*******************************************************************************
     * Model *
     ******************************************************************************/

    // JSON object for storing the data model.
    var m = {};
    m.labels = mdlLocalization.getLocLabels(lan);
    m.maxAreaHa = 1000000;
    m.evalSet = {};

    // More info & contact
    m.info = {
        referenceDocUrl: 'https://drive.google.com/file/d/13cXxrdCZiTDAg7Axr6uj74fGWgpBmyNS/view?usp=sharing',
        contact1: 'contact@',
        contactEmail1: 'contact@',
        contact2: '',
        contactEmail2: '',
        contact3: '',
        contactEmail3: '',
    };

    m.ftcAOI = ftc0;
    m.levelAOI = m.labels.lblLevel0;
    m.precalculated = true;

    m.lpdPalettes = {
        'Palette - Option 1': ["#040404", '#f23c46', '#e9a358', '#e5e6b3', '#a9afae', '#267300'], // dark gray
        'Palette - Option 2': ['black', '#f23c46', '#ffae4c', '#ffff73', '#d9d8e6', '#267300'], // light gray - app default
        'Palette - Option 3': ['black', '#9b2779', '#c0749b', '#e1b9bd', '#ffffe0', '#006500'], // te-jrc
    };

    m.defaultLPDPalette = m.lpdPalettes[Object.keys(m.lpdPalettes)[0]];

    m.lv = {

        lpd: {
            vis: {
                min: 0,
                max: 5,
                opacity: 1,
                palette: m.defaultLPDPalette

            },
            names: [
                m.labels.lblNoData,
                m.labels.lblDeclining,
                m.labels.lblEarlySignDecline,
                m.labels.lblStableButStressed,
                m.labels.lblStable,
                m.labels.lblIncreasing,
            ],
            cat: [0, 1, 2, 3, 4, 5]
        },

        highlight: {
            vis: {
                color: 'blue',
                fillColor: '00000000'
            }
        },
        clickOn: {
            vis: {
                color: 'red',
                fillColor: '00000000',
                width: 1
            }
        },
    };


    m.imagesOptions = mdlPrecalculation.lpdSources;

    // Unmask lpds toshow no data & clip to country boundaries
    Object.keys(m.imagesOptions).forEach(function (key, index) {
        Object.keys(m.imagesOptions[key]).forEach(function (keyp, indexp) {
            m.imagesOptions[key][keyp].imgMap = m.imagesOptions[key][keyp].imgMap.unmask().clip(ftc0);
        });
    });

    /*******************************************************************************
     * Components *
     ******************************************************************************/

    // Define a JSON object for storing UI components.
    var c = {};

    /** UI COMPONENTS FOR THE MAPS */

    c.mapLeft = ui.Map({
        style: {
            width: '40%'
        }
    });
    c.mapLeft.setControlVisibility(false);

    c.mapRight = ui.Map({
        style: {
            width: '40%'
        }
    });
    c.mapRight.setOptions('HYBRID');
    c.mapLeft.setOptions('HYBRID');
    c.mapRight.setControlVisibility(false);

    // Add initial empty layers to set the layers order
    var INDEX_LPD = 0;
    var INDEX_SELECTED_AOI = 1;
    var INDEX_POINT = 2;
    var INDEX_CLICK_ON = 3;
    var INDEX_MASK_AOI = 4;


    [INDEX_LPD, INDEX_SELECTED_AOI, INDEX_POINT, INDEX_CLICK_ON, INDEX_MASK_AOI].map(function (i) {
        c.mapLeft.layers().set(i, ui.Map.Layer(ee.Geometry.Point([0, 0]), {}, m.labels.lblLPD, false));
        c.mapRight.layers().set(i, ui.Map.Layer(ee.Geometry.Point([0, 0]), {}, m.labels.lblLPD, false));
    })

    // Periods from precalculation script
    var defaultPeriod = 'Reporting Period 2 2008-2023';
    var periodItems = Object.keys(mdlPrecalculation.lpdSources);

    /* Left map components: Period selector, Product selector, Opacity slider */
    c.selLeftPeriods = ui.Select({
        items: periodItems,
        value: defaultPeriod,
        style: {
            width: '90%'
        }
    });
    c.selLeftPeriods.onChange(function (period) {
        handleLeftLayerChange(c.selLeftLayers.getValue());
    });
    c.selLeftLayers = ui.Select({
        items: Object.keys(m.imagesOptions[defaultPeriod]),
        style: {
            width: '90%'
        }
    });
    c.lblLeftOpacity = ui.Label(m.labels.lblOpacity);
    c.sldLeftOpacity = ui.Slider({
        min: 0,
        max: 1,
        value: 1,
        step: 0.1,
    });
    c.sldLeftOpacity.onSlide(function (value) {
        c.mapLeft.layers().get(0).setOpacity(value);
    });
    c.pnlLeftSlider = ui.Panel({
        widgets: [c.lblLeftOpacity, c.sldLeftOpacity],
        layout: ui.Panel.Layout.Flow('horizontal'),
    });

    c.pnlLeftLayerSelector = ui.Panel({
        widgets: [c.selLeftPeriods, c.selLeftLayers]
    });

    // Pie Chart for selected map
    c.pnlLeftChart = ui.Panel({
        style: {
            width: '200px',
            height: '160px',
            margin: 0,
            padding: 0,
            position: 'bottom-left',
        }
    });

    /* Right map components: Period selector, Product selector, Opacity slider */
    c.selRightPeriods = ui.Select({
        items: periodItems,
        value: defaultPeriod,
        style: {
            width: '90%'
        }
    });
    c.selRightPeriods.onChange(function (period) {
        handleRightLayerChange(c.selRightLayers.getValue());

    });
    c.selRightLayers = ui.Select({
        items: Object.keys(m.imagesOptions[defaultPeriod]),
        style: {
            width: '90%'
        }
    });

    c.lblRightOpacity = ui.Label(m.labels.lblOpacity);
    c.sldRightOpacity = ui.Slider({
        min: 0,
        max: 1,
        value: 1,
        step: 0.1,
    });
    c.sldRightOpacity.onSlide(function (value) {
        c.mapRight.layers().get(0).setOpacity(value);
    });
    c.pnlRightSlider = ui.Panel({
        widgets: [c.lblRightOpacity, c.sldRightOpacity],
        layout: ui.Panel.Layout.Flow('horizontal'),
    });

    c.pnlRightLayerSelector = ui.Panel([c.selRightPeriods, c.selRightLayers]);

    // Pie Chart for selected map
    c.pnlRightChart = ui.Panel({
        style: {
            width: '200px',
            height: '160px',
            margin: 0,
            padding: 0,
            position: 'bottom-right'
        }
    });


    c.sppMaps = ui.SplitPanel({
        firstPanel: c.mapLeft,
        secondPanel: c.mapRight,
        wipe: true,
        style: {
            stretch: 'both'
        }
    });

    /** UI COMPONENTS FOR THE RIGHT COLUMN */
    c.pnlOutput = ui.Panel();
    c.pnlOutput.style().set({
        'width': '35%',
        fontSize: '12px'
    });

    /* Legend panel */
    c.pnlLegend = ui.Panel();

    // Section title
    c.lblLegendSectionTitle = ui.Label(m.labels.lblLPDLegend);

    // Palettes selector    
    c.selLPDPalette = ui.Select({
        items: Object.keys(m.lpdPalettes),
        value: Object.keys(m.lpdPalettes)[0],
        style: {
            margin: 0
        },
        onChange: function (option) {

            m.lv.lpd.vis.palette = m.lpdPalettes[option];
            c.pnlLegend.widgets().set(1, mdlLegends.createDiscreteLegendPanel(m.labels.lblLPDLegend, m.lv.lpd.names, m.lv.lpd.vis.palette, false, false));

            // Reload charts
            showInfoAOI();

            // Change visualization parameters
            c.mapLeft.layers().get(INDEX_LPD).setVisParams(m.lv.lpd.vis);
            c.mapRight.layers().get(INDEX_LPD).setVisParams(m.lv.lpd.vis);

        }
    });

    c.pnlLegend.widgets().set(0, c.selLPDPalette);
    // Legend panel with categories and colors
    c.pnlLegend.widgets().set(1, mdlLegends.createDiscreteLegendPanel(m.labels.lblLPDLegend, m.lv.lpd.names, m.lv.lpd.vis.palette, false, false));

    c.pnlLegendContainer = ui.Panel({
        widgets: [c.pnlLegend],
        style: {
            margin: '0px 10px'
        }
    });

    /* Messages panel */
    c.lblMessages = ui.Label({
        style: {
            color: 'blue',
            fontSize: '12px'
        }
    });
    c.pnlMessages = ui.Panel({
        widgets: [c.lblMessages]
    });

    // Language selector panel 
    c.selLanguage = ui.Select({
        items: ['English', 'Spanish'],
        value: lan,
        style: {
            margin: '0px 10px'
        }
    });

    /* Intro panel */
    c.pnlIntro =
        ui.Panel([c.pnlMessages,
        /*ui.Label({
            value: m.labels.lblClickHereMoreInfo,
            style: { fontSize: '12px', textAlign: 'rigth' },
        }).setUrl(m.info.url),*/
        ui.Label({
            value: m.labels.lblTitle,
            style: {
                fontSize: '20px',
                fontWeight: 'bold'
            }
        }),
        ui.Label({
            value: m.labels.lblExpl1,
            style: {
                margin: '5px 10px'
            }
        }),
        ui.Label({
            value: m.labels.lblClickLink1,
            style: {
                fontSize: '12px',
                textAlign: 'rigth'
            },
        }).setUrl('https://www.unccd.int/resources/manuals-and-guides/addendum-good-practice-guidance-sdg-indicator-1531-proportion-land'),
        ui.Label({
            value: m.labels.lblClickLink3,
            style: {
                fontSize: '12px',
                textAlign: 'rigth'
            },
        }).setUrl('https://apacheta.projects.earthengine.app/view/lpd-realtime-sids'),
        ui.Label({
            value: m.labels.lblClickLink2,
            style: {
                fontSize: '12px',
                textAlign: 'rigth'
            },
        }).setUrl('https://apacheta.projects.earthengine.app/view/lpd-realtime'),
            /*ui.Label({
               value: m.labels.lblPointsForm,
               style: {
                   fontSize: '12px',
                   textAlign: 'rigth'
               },
           }).setUrl(''),*/
            /*ui.Label({
                value: m.labels.lblLanguage,
                style: { margin: '5px 10px' }
            }),
            c.selLanguage*/
        ]);

    /* Contact panel */
    c.pnlContact = ui.Panel({
        widgets: [
             /*ui.Label({
                value: m.labels.lblUserManual,
                targetUrl: m.info.referenceDocUrl,
                style: {
                    margin: '5px 5px 10px'
                }
            }),*/
            ui.Label({
                value: m.labels.lblAppDeveloped,
                style: {
                    margin: '0px 5px'
                }
            }),
            ui.Label({
                value: m.info.contact1,
                targetUrl: 'mailto:' + m.info.contactEmail1,
                style: {
                    margin: '0px 5px'
                }
            }),
            /* ui.Label({
                 value: m.info.contact2,
                 targetUrl: 'mailto:' + m.info.contactEmail2,
                 style: {
                     margin: '0px 5px'
                 }
             }),
             ui.Label({
                 value: m.info.contact3,
                 targetUrl: 'mailto:' + m.info.contactEmail3,
                 style: {
                     margin: '0px 5px'
                 }
             }),*/
        ],
        style: {
            margin: '5px 5px'
        }
    });

    /* Explore panel */
    c.pnlExplore =
        ui.Panel([
            ui.Label({
                value: m.labels.lblExplore,
                style: {
                    margin: '5px 10px 5px 10px',
                    whiteSpace: 'pre-wrap'
                }
            })
        ]);


    // Feature collections options to click on the map to obtain precalculated statistics
    m.assetsClick = {};
    m.assetsClick[m.labels.lblNone] = null;
    m.assetsClick[m.labels.lblPixelExplorer] = null;
    m.assetsClick[m.labels.lblLevel1] = ftc1;

    // Feature collection to query on map click
    m.ftcClickOn = null;

    /** Layers available to click on the map */
    c.lblChoose = ui.Label({
        value: m.labels.lblAssetClick,
        style: {
            margin: '5px 10px'
        }
    });

    c.selLayersToClickOn = ui.Select({
        items: Object.keys(m.assetsClick),
        value: m.labels.lblNone,
        style: {
            margin: '0px 10px',
            width: '25%'
        },
    });
    c.selLayersToClickOn.onChange(function (v) {
        m.ftcClickOn = m.assetsClick[v];

        // show layer on map if ftc !=null
        if (m.ftcClickOn !== null) {
            c.mapLeft.layers().set(INDEX_CLICK_ON, ui.Map.Layer(m.ftcClickOn.style(m.lv.clickOn.vis), {}, m.labels.lblClickOn));
            c.mapRight.layers().set(INDEX_CLICK_ON, ui.Map.Layer(m.ftcClickOn.style(m.lv.clickOn.vis), {}, m.labels.lblClickOn));
        } else {
            c.mapLeft.layers().get(INDEX_CLICK_ON).setShown(false);
            c.mapRight.layers().get(INDEX_CLICK_ON).setShown(false);
        }
    });



    /* Administrative boundaries section: Country or level1*/
    c.levels = {};
    c.lblChoose = ui.Label(m.labels.lblExpl2 + ' (*)', {
        margin: '5px 10px'
    });
    c.selLevel1 = ui.Select({
        items: [],
        placeholder: m.labels.lblSelectLevel1,
        style: {
            width: '25%'
        }
    });

    c.btnSelectContainer = ui.Button({
        label: m.labels.lblSelectContainer,
        style: {
            margin: '10px 5px'
        }
    });
    c.pnlSelectBoundaries = ui.Panel(
        [
            ui.Panel([ui.Label({
                value: m.labels.lblLayers + ":",
                style: {
                    margin: '15px 0px 0px 5px',
                    width: '15%'
                }
            }), c.selLayersToClickOn], ui.Panel.Layout.flow('horizontal')),

            ui.Panel(
                [ui.Label({
                    value: m.labels.lblLevel1 + ":",
                    style: {
                        margin: '20px 0px 0px 5px',
                        width: '15%'
                    }
                }), c.selLevel1, c.btnSelectContainer], ui.Panel.Layout.flow('horizontal')),
        ]
    );
    c.btnCloseInfoPanel = ui.Button(m.labels.lblCloseInfoPanel);
    c.btnCloseInfoPanel.onClick(function () {
        c.pnlExplore.style().set({
            shown: !c.pnlExplore.style().get('shown')
        });
        c.btnCloseInfoPanel.setLabel(c.pnlExplore.style().get('shown') ? m.labels.lblCloseInfoPanel : m.labels.lblOpenInfoPanel);
    });


    /** AOI Mask Section */
    c.chkMaskAOI = ui.Checkbox(m.labels.lblAOIMask, false);
    c.chkMaskAOI.onChange(function (checked) {
        c.mapLeft.layers().get(INDEX_MASK_AOI).setShown(checked);
        c.mapRight.layers().get(INDEX_MASK_AOI).setShown(checked)
    });
    c.sldOpacity = ui.Slider({
        min: 0,
        max: 1,
        value: 1,
        step: 0.1,
    });
    c.pnlMaskAOI = ui.Panel({
        widgets: [c.chkMaskAOI, c.sldOpacity],
        layout: ui.Panel.Layout.Flow('horizontal'),
    });
    c.sldOpacity.onSlide(function (value) {
        c.mapLeft.layers().get(INDEX_MASK_AOI).setOpacity(value);
        c.mapRight.layers().get(INDEX_MASK_AOI).setOpacity(value);
    });

    /* Asset id - Load a FeatureCollection from GEE panel*/
    c.lblCustomAssetSectionTitle = ui.Label(m.labels.lblCustomAsset);
    c.customAsset = {};
    c.lblEnterAssetId = ui.Label(m.labels.lblEnterAssetId);
    c.txtAssetId = ui.Textbox(m.labels.lblAssetId, '');
    c.btnLoadAsset = ui.Button(m.labels.lblLoadAsset);
    c.pnlCustomAsset = ui.Panel({
        layout: ui.Panel.Layout.flow('vertical'),
        widgets: [ui.Panel({
            layout: ui.Panel.Layout.flow('vertical'),
            widgets: [c.lblEnterAssetId]
        }),
        ui.Panel({
            layout: ui.Panel.Layout.flow('horizontal'),
            widgets: [c.txtAssetId, c.btnLoadAsset]
        })
        ]
    });



    /** AOI Section */
    c.lblAOISectionTitle = ui.Label(m.labels.lblSelectedAOI);

    c.lblTotalArea = ui.Label({
        value: m.labels.lblTotalArea,
        style: {
            fontWeight: 'bold'
        }
    });
    c.lblAreaValue = ui.Label({
        value: ''
    });
    c.pnlArea = ui.Panel([c.lblTotalArea, c.lblAreaValue], ui.Panel.Layout.flow('horizontal'), {
        margin: '0px 5px'
    });

    c.lblName = ui.Label({
        value: m.labels.lblName,
        style: {
            fontWeight: 'bold'
        }
    });
    c.lblNameValue = ui.Label({
        value: ''
    });
    c.pnlName = ui.Panel([c.lblName, c.lblNameValue], ui.Panel.Layout.flow('horizontal'), {
        margin: '0px 5px'
    });

    /** NDVI Section */
    // Coordinates panel
    c.btnSectionFlyTo = ui.Button(m.labels.lblFlyTo);
    c.lblFlyTo = ui.Label(m.labels.lblFlyToText);
    c.txtLat = ui.Textbox(m.labels.lblLatitude, '');
    c.txtLon = ui.Textbox(m.labels.lblLongitude, '');
    c.btnGo = ui.Button(m.labels.lblGo);
    c.btnUserLocation = ui.Button(m.labels.lblUserLocation + '\u25BC');
    c.btnRemoveLocation = ui.Button(m.labels.lblRemoveLocation + ' \u2716');

    /* Demo points selector */
    var handleOnChangeDemoPoint = function (pointName) {
        var selectedPoint = demoPoints[pointName];
        var coords = [selectedPoint.lon, selectedPoint.lat];
        goToPoint(coords);
    };

    c.selDemoPoints = ui.Select({
        items: Object.keys(demoPoints),
        style: { width: "50%" },
        placeholder: m.labels.lblSelectPoint,
        onChange: handleOnChangeDemoPoint,
    });

    c.pnlFlyTo = ui.Panel({
        layout: ui.Panel.Layout.flow('vertical'),
        widgets: [
            c.lblFlyTo,
            c.selDemoPoints,
            ui.Panel({
                layout: ui.Panel.Layout.flow('horizontal'),
                widgets: [c.txtLat, c.txtLon, c.btnGo, c.btnUserLocation, c.btnRemoveLocation]
            })

        ]
    });

    // Selected coordinates panel
    c.lblNDVISectionTitle = ui.Label(m.labels.lblNDVIProfile);
    c.lblLon = ui.Label();
    c.lblLat = ui.Label();
    c.pnlCoordinates = ui.Panel([ui.Label(m.labels.lblSelectedPoint), c.lblLat, c.lblLon], ui.Panel.Layout.flow('horizontal'), {
        margin: '0px 5px'
    });

    // NDVI charts panel
    c.pnlChartsNDVI = ui.Panel();


    /** LPD Stats Section */
    c.lblStatsSectionTitle = ui.Label(m.labels.lblLPDStatistics);
    c.pnlCharts = ui.Panel();

    /* Disclaimer Section*/
    c.lblDisclaimer = ui.Label(m.labels.lblDisclaimer);

    /*******************************************************************************
     * Composition *
     ******************************************************************************/
    // Set the SplitPanel as the only thing in the UI root.
    ui.root.widgets().reset([ui.SplitPanel({
        firstPanel: ui.Panel(c.sppMaps),
        secondPanel: c.pnlOutput,
    })])
    c.lnkMaps = ui.Map.Linker([c.mapLeft, c.mapRight]);

    c.mapLeft.style().set('cursor', 'crosshair');
    c.mapRight.style().set('cursor', 'crosshair');

    c.mapLeft.add(c.pnlLeftLayerSelector);
    c.mapLeft.add(c.pnlLeftSlider);
    c.mapLeft.add(c.pnlLeftChart);

    c.mapRight.add(c.pnlRightLayerSelector);
    c.mapRight.add(c.pnlRightSlider);
    c.mapRight.add(c.pnlRightChart);

    c.pnlOutput.add(c.pnlIntro);
    c.pnlOutput.add(c.pnlContact);
    c.pnlOutput.add(c.pnlExplore);
    //c.pnlOutput.add(c.lan.selLanguage);
    c.pnlOutput.add(c.btnCloseInfoPanel);

    c.pnlOutput.add(c.pnlSelectBoundaries);

    c.pnlOutput.add(c.lblAOISectionTitle);
    c.pnlOutput.add(c.pnlName);
    c.pnlOutput.add(c.pnlArea);
    c.pnlOutput.add(c.pnlMaskAOI);

    c.pnlOutput.add(c.lblNDVISectionTitle);
    c.pnlOutput.add(c.pnlFlyTo);
    c.pnlOutput.add(c.pnlCoordinates);
    c.pnlOutput.add(c.pnlChartsNDVI);

    c.pnlOutput.add(c.lblCustomAssetSectionTitle);
    c.pnlOutput.add(c.pnlCustomAsset);

    c.pnlOutput.add(c.lblStatsSectionTitle);
    c.pnlOutput.add(c.pnlCharts);

    c.pnlOutput.add(c.lblLegendSectionTitle);
    c.pnlOutput.add(c.pnlLegendContainer);

    c.pnlOutput.add(c.lblDisclaimer);

    /*******************************************************************************
     * 4-Styling *
     ******************************************************************************/

    // JSON object for defining CSS-like class style properties.
    var s = {};
    s.styleMessage = {
        color: 'gray',
        fontSize: '12px',
        padding: '2px 0px 2px 10px'
    };

    var sectionStyle = {
        fontWeight: 'bold',
        fontSize: '14px',
        padding: '4px 4px 4px 4px',
        border: '1px solid black',
        color: 'white',
        backgroundColor: 'black',
        textAlign: 'left',
        stretch: 'horizontal'
    };

    c.lblLegendSectionTitle.style().set(sectionStyle);
    c.lblAOISectionTitle.style().set(sectionStyle);
    c.lblStatsSectionTitle.style().set(sectionStyle);
    c.lblNDVISectionTitle.style().set(sectionStyle);
    c.lblCustomAssetSectionTitle.style().set(sectionStyle);

    c.selLanguage.style().set({
        width: '30%'
    });

    c.pnlLeftLayerSelector.style().set({
        position: "top-left",
        margin: 0,
        padding: 0,
        backgroundColor: 'rgba(255, 255, 255, 0)',
    });
    c.pnlLeftSlider.style().set({
        position: "bottom-left",
        margin: 0,
        padding: 0
    });

    c.pnlRightLayerSelector.style().set({
        position: "top-right",
        margin: 0,
        padding: 0,
        backgroundColor: 'rgba(255, 255, 255, 0)'
    });
    c.pnlRightSlider.style().set({
        position: "bottom-right",
        margin: 0,
        padding: 0
    });

    c.lblLeftOpacity.style().set({
        fontSize: '12px'
    });
    c.lblRightOpacity.style().set({
        fontSize: '12px'
    });

    c.lblDisclaimer.style().set({
        fontSize: '10px',
        margin: '2px 10px'
    });

    c.lblFlyTo.style().set({
        fontSize: '12px',
        margin: '2px 10px'
    });
    c.txtLat.style().set({
        width: '15%',
        margin: '5px 5px'
    });
    c.txtLon.style().set({
        width: '15%',
        margin: '5px 5px'
    });
    c.btnGo.style().set({
        margin: '5px 5px'
    });

    c.btnUserLocation.style().set({
        margin: '5px 5px'
    });
    c.btnRemoveLocation.style().set({
        margin: '5px 5px'
    });

    c.btnSectionFlyTo.style().set({
        width: '90%',
        fontSize: '6px',
        fontWeight: 'normal'
    });
    c.pnlFlyTo.style().set({
        margin: '5px 5px',
        shown: true
    }); // border: '1px solid black',

    c.pnlCustomAsset.style().set({
        margin: '5px 5px',
        shown: true
    });
    c.lblEnterAssetId.style().set({
        fontSize: '12px'
    });
    c.txtAssetId.style().set({
        width: '60%',
        fontSize: '12px'
    });

    c.btnSectionFlyTo.onClick(function () {
        c.pnlFlyTo.style().set({
            shown: !c.pnlFlyTo.style().get('shown')
        });
    });

    c.chkMaskAOI.style().set({
        margin: '10px'
    });
    c.pnlMaskAOI.style().set({
        fontSize: '12px',
        margin: '2px 5px'
    });

    /*******************************************************************************
     * Behaviors *
     ******************  ************************************************************/

    c.selLanguage.onChange(function (lan) {
        initApp(lan);
    });

    c.btnLoadAsset.onClick(function () {
        var assetId = c.txtAssetId.getValue().trim();
        if (assetId === '') {
            c.pnlMessages.style().set({
                shown: true
            });
            c.lblMessages.setValue(m.labels.lblInvalidAssetId);
            return;
        }
        try {
            c.pnlMessages.style().set({
                shown: true
            });
            c.lblMessages.setValue(m.labels.lblProcessingCustomAsset);

            var ftcCustom = ee.FeatureCollection(assetId);
            ftcCustom.size().getInfo(function (size) {
                if (size === undefined) {
                    c.pnlMessages.style().set({
                        shown: true
                    });
                    c.lblMessages.setValue(m.labels.lblInvalidAssetId);
                } else {
                    handleCustomFeatureCollection(ftcCustom.geometry(), assetId, m.labels.lblCustomAsset);
                }
            });
        } catch (err) {
            c.pnlMessages.style().set({
                shown: true
            });
            c.lblMessages.setValue(m.labels.lblInvalidAssetId + ': ' + err);
        }
    });



    /** Function to enable/disable ui components that allows new aoi query */
    var handleEvaluating = function (disable) {

        c.selLanguage.setDisabled(disable);
        c.btnLoadAsset.setDisabled(disable);
        c.selLevel1.setDisabled(disable);
        c.btnSelectContainer.setDisabled(disable);
        c.selLayersToClickOn.setDisabled(disable);

        if (m.precalculated)
            c.lblMessages.setValue(disable ? m.labels.lblProcessingArea : '');
        else
            c.lblMessages.setValue(disable ? m.labels.lblProcessing : '');

        c.pnlMessages.style().set({
            shown: disable
        });

    };

    /** Handle custom ftc */
    var handleCustomFeatureCollection = function (gmy, name, level) {

        var f = ee.Feature(gmy).set('area_ha', gmy.area({
            'maxError': 1
        }).divide(10000));
        f = f.set('name', name);

        handleEvaluating(true);
        f.get('area_ha').evaluate(function (area, error) {
            if (error) {
                handleEvaluating(false);
                c.lblMessages.setValue(m.labels.lblUnexpectedError + error);
                c.pnlMessages.style().set({
                    shown: true
                });
                return;
            }
            if (area > m.maxAreaHa) {
                handleEvaluating(false);
                c.lblMessages.setValue(m.labels.lblSmallerArea +
                    formatNumber(m.maxAreaHa, 2) + 'ha. ' +
                    m.labels.lblSelectedAreaHa +
                    ' ' + formatNumber(area, 2) + 'ha.');
                c.pnlMessages.style().set({
                    shown: true
                });
                return;
            }
            ftc0.geometry().contains(gmy, 1).evaluate(function (contained, error) {
                if (error) {
                    handleEvaluating(false);
                    c.lblMessages.setValue(m.labels.lblUnexpectedError + error);
                    c.pnlMessages.style().set({
                        shown: true
                    });
                    return;
                }

                if (!contained) {
                    handleEvaluating(false);
                    c.lblMessages.setValue(m.labels.lblGeometryNotContained);
                    c.pnlMessages.style().set({
                        shown: true
                    });
                    return;
                }
                m.ftcAOI = ee.FeatureCollection(f);
                m.precalculated = false;
                m.haAoi = area;
                m.levelAOI = level;

                showInfoAOI();
            });
        });
    };

    function goToPoint(coords) {
        try {
            var gmyPoint = ee.Geometry.Point(coords);

            c.mapLeft.centerObject(gmyPoint, 10);

            handleOnMapClick({
                "lon": coords[0],
                "lat": coords[1]
            });

        } catch (error) {
            c.lblMessages.setValue(error);
        }


    }


    c.btnGo.onClick(function () {
        var coords = [parseFloat(c.txtLon.getValue()), parseFloat(c.txtLat.getValue())];
        goToPoint(coords);

    });


    c.btnUserLocation.onClick(function () {
        c.pnlMessages.style().set({
            shown: false
        });

        var handlePosition = function (position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            if (navigator.geolocation) {
                var point = ee.Geometry.Point([lon, lat]);
                c.mapLeft.centerObject(point);
                handleOnMapClick({
                    "lon": lon,
                    "lat": lat
                });

            } else {
                c.pnlMessages.style().set({
                    shown: true
                });
                c.lblMessages.setValue(m.labels.lblLocNotSupported);
            }
        };
        var handleLocError = function (error) {
            c.pnlMessages.style().set({
                shown: true
            });
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    c.lblMessages.setValue(m.labels.lblPermissionDenied);
                    break;
                case error.POSITION_UNAVAILABLE:
                    c.lblMessages.setValue(m.labels.lblPositionUnavailable);
                    break;
                case error.TIMEOUT:
                    c.lblMessages.setValue(m.labels.lblTimeout);
                    break;
                case error.UNKNOWN_ERROR:
                    c.lblMessages.setValue(m.labels.lblUnknownError);
                    break;
            }
        }
        navigator.geolocation.getCurrentPosition(handlePosition, handleLocError);
    });


    c.btnRemoveLocation.onClick(function () {
        c.mapLeft.layers().get(INDEX_POINT).setShown(false);
        c.mapRight.layers().get(INDEX_POINT).setShown(false);
    });


    // Creates the PieChart to load on the maps using the calculated statistics
    var generateChart = function (e, pnl, title) {

        if (m.ef === undefined) return;

        var header = [{
            type: 'string',
            label: m.labels.lblProduct,
            role: 'domain',
        }, {
            type: 'number',
            label: 'value',
            role: 'data',
        }];

        var dt = [];
        dt.push(header);

        e.colNames.map(function (col, i) {
            dt.push([m.lv.lpd.names[i], m.ef.properties[col]]);
        })


        var options = {
            title: title,
            colors: m.lv.lpd.vis.palette,
            legend: {
                position: 'none'
            },
            margin: 0,
            padding: 0,
            backgroundColor: '#ff000000',
            pieSliceTextStyle: {
                color: 'black',
            },
        };

        var chart = ui
            .Chart(dt)
            .setChartType('PieChart')
            .setOptions(options);

        pnl.widgets().set(0, chart);

    }

    // Load selected layer on left map and re generate chart
    function handleLeftLayerChange(layerSelected) {
        var period = c.selLeftPeriods.getValue();
        var entry = m.imagesOptions[period][layerSelected];
        c.mapLeft.layers().set(INDEX_LPD, ui.Map.Layer(entry.imgMap, m.lv.lpd.vis, m.labels.lblLPD));
        generateChart(entry, c.pnlLeftChart, layerSelected);
    }
    // Load selected layer on right map and re generate chart
    function handleRightLayerChange(layerSelected) {
        var period = c.selRightPeriods.getValue();
        var entry = m.imagesOptions[period][layerSelected];
        c.mapRight.layers().set(INDEX_LPD, ui.Map.Layer(entry.imgMap, m.lv.lpd.vis, m.labels.lblLPD));
        generateChart(entry, c.pnlRightChart, layerSelected);
    }

    c.selLeftLayers.onChange(handleLeftLayerChange);
    c.selRightLayers.onChange(handleRightLayerChange);

    // Filter selected level 1 aoi and load charts
    var handleChangeLevel1 = function (level1Code) {
        m.precalculated = true;

        if (level1Code !== null) {
            m.levelAOI = m.labels.lblLevel1;
            m.ftcAOI = ftc1.filter(ee.Filter.eq('ADM1_CODE', level1Code));
            showInfoAOI();
        }
    };

    // Reset level 1 selector
    var resetLevelsSelects = function () {
        c.selLevel1.unlisten();
        c.selLevel1.items().reset(m.siLevel1);
        c.selLevel1.setPlaceholder(m.labels.lblSelectLevel1);
        c.selLevel1.setValue(null);
        c.selLevel1.onChange(handleChangeLevel1);
    };
    c.selLevel1.onChange(handleChangeLevel1);

    // 
    var handleOnMapClick = function (coords) {

        // Update the lon/lat labels with values from the click event.
        c.lblLon.setValue(m.labels.lblLongitude + ': ' + coords.lon);
        c.lblLat.setValue(m.labels.lblLatitude + ': ' + coords.lat);

        // Update the coordinates panel coordinates
        c.txtLon.setValue(coords.lon);
        c.txtLat.setValue(coords.lat);

        c.pnlChartsNDVI.clear();

        var gmyPoint = ee.Geometry.Point(coords.lon, coords.lat);
        var imgPoint = ee.FeatureCollection(gmyPoint).draw({
            color: '#6F20A8',
            pointRadius: 5
        });

        // Always add the point
        c.mapRight.layers().set(INDEX_POINT, ui.Map.Layer(imgPoint, {}, m.labels.lblPoint));
        c.mapLeft.layers().set(INDEX_POINT, ui.Map.Layer(imgPoint, {}, m.labels.lblPoint));

        if (c.selLayersToClickOn.getValue() === m.labels.lblPixelExplorer) {

            var lstFeaturesModis = imcByYear.map(function (image) {
                var ndvi = image.reduceRegion({
                    reducer: ee.Reducer.mean(),
                    geometry: gmyPoint,
                    scale: 10
                }).get('NDVI_Annual_Mean');
                var year = ee.Date(image.get('system:time_start')).get('year');
                return ee.Feature(null, {
                    'ndvi': ndvi,
                    'year': ee.String(year),
                    'series': 'MODIS NDVI FAO-WOCAT'
                });
            });


            var lstFeaturesModisTE = imgNDVITE.bandNames().getInfo().map(function (bandName) {
                bandName = ee.String(bandName);
                var year = ee.Number(bandName.slice(bandName.index('y').add(1)));
                var singleImage = imgNDVITE.select(bandName);
                var ndvi = singleImage.reduceRegion({
                    reducer: ee.Reducer.mean(),
                    geometry: gmyPoint,
                    scale: 10
                }).get(bandName);
                var f = ee.Feature(null, {
                    'ndvi': ndvi,
                    'year': ee.String(year),
                    'series': 'MODIS NDVI Trends.Earth'
                });
                return f;
            });



             var lstFeaturesMIXED = imgNDVILSMixed30m.bandNames().map(function (bandName) {
                bandName = ee.String(bandName);
                var year = ee.Number(bandName.slice(bandName.index('_').add(1)));
                var singleImage = imgNDVILSMixed30m.select(bandName);
                var ndvi = singleImage.reduceRegion({
                    reducer: ee.Reducer.mean(),
                    geometry: gmyPoint,
                    scale: 10
                }).get(bandName);
                return ee.Feature(null, { 'ndvi': ndvi, 'year': year, 'series': 'Mixed Landsat NDVI' });
            });
            
            var lstFeaturesCBAS = imgNDVICBAS.bandNames().map(function (bandName) {
                bandName = ee.String(bandName);
                var year = ee.Number(bandName.slice(bandName.index('_').add(1)));
                var singleImage = imgNDVICBAS.select(bandName);
                var ndvi = singleImage.reduceRegion({
                    reducer: ee.Reducer.mean(),
                    geometry: gmyPoint,
                    scale: 1
                }).get(bandName);
                return ee.Feature(null, { 'ndvi': ndvi, 'year': year, 'series': 'HiLPD NDVI' });
            });

            var ftcAll = ee.FeatureCollection(lstFeaturesModisTE).merge(lstFeaturesModis).merge(lstFeaturesMIXED).merge(lstFeaturesCBAS);


            var chart = ui.Chart.feature.groups({
                features: ftcAll,
                xProperty: 'year',
                yProperty: 'ndvi',
                seriesProperty: 'series'
            }).setOptions({
                title: m.labels.lblNDVIAnnualMeanAtPoint, // NDVI x 10000 Annual Mean at the point
                hAxis: {
                    'title': m.labels.lblCalendarYear,
                    format: '####'
                },
                vAxis: {
                    'title': m.labels.lblNDVIAnnualMean
                },
                series: {
                    0: {
                        color: 'blue'
                    },
                    1: {
                        color: 'green'
                    },
                    2: {
                        color: 'black'
                    },
                    3: {
                        color: 'red'
                    },


                }
            });


            c.pnlChartsNDVI.add(chart);


            // Create an NDVI calendar yearchart.
            var calChart = ui.Chart.image.series(imcByMonthYear, gmyPoint, ee.Reducer.mean(), 250);

            calChart.setOptions({
                title: m.labels.lblMonthlyNDVI,
                vAxis: {
                    title: 'NDVI x 10000'
                },
                hAxis: {
                    title: m.labels.lblCalendarYear,
                    format: 'yyyy',
                    gridlines: {
                        count: 7
                    }
                },
            });

            c.pnlChartsNDVI.widgets().set(2, calChart);

        }
        // 
        else if (c.selLayersToClickOn.getValue() !== m.labels.lblNone) {

            m.precalculated = true;

            c.pnlCharts.clear();

            if (m.ftcClickOn === null) {
                c.pnlMessages.style().set({
                    shown: true
                });
                c.lblMessages.setValue(m.labels.lblSelectLayer);
                return;
            }
            var ftcCheck = m.ftcClickOn.filterBounds(ee.Geometry.Point(coords.lon, coords.lat));

            ftcCheck.size().getInfo(function (size) {

                if (size > 0) {
                    m.ftcAOI = ftcCheck;
                    Object.keys(m.assetsClick).forEach(function (key) {
                        if (m.assetsClick[key] === m.ftcClickOn) {
                            m.levelAOI = key;
                        }
                    });
                    showInfoAOI();
                } else {
                    c.pnlMessages.style().set({
                        shown: true
                    });
                    c.lblMessages.setValue(m.labels.lblNoFeature);
                }
            });
        } else {
            c.pnlMessages.style().set({
                shown: true
            });
            c.lblMessages.setValue(m.labels.lblLayerSelected);
        }
    };


    c.mapLeft.onClick(handleOnMapClick);
    c.mapRight.onClick(handleOnMapClick);

    var formatNumber = function (number, digits) {
        return number.toLocaleString('en-US', {
            minimumFractionDigits: digits,
            maximumFractionDigits: digits
        });
    };
    var sortByLabel = function (a, b) {
        if (a.label < b.label) {
            return -1;
        }
        if (a.label > b.label) {
            return 1;
        }
        return 0;
    };


    var showInfoAOI = function () {

        c.pnlCharts.clear();

        // Load selected AOI  on the maps
        var eeObjectAOI = m.ftcAOI.style(m.lv.highlight.vis);
        c.mapLeft.centerObject(m.ftcAOI);
        c.mapLeft.layers().set(INDEX_SELECTED_AOI, ui.Map.Layer(eeObjectAOI, {}, m.labels.lblSelectedAOI));
        c.mapRight.layers().set(INDEX_SELECTED_AOI, ui.Map.Layer(eeObjectAOI, {}, m.labels.lblSelectedAOI));

        // Create AOI mask
        var eeObjectAOIMask = ee.Image(1).updateMask(ee.Image(1).clip(m.ftcAOI).unmask().eq(0));
        c.mapLeft.layers().set(INDEX_MASK_AOI, ui.Map.Layer(eeObjectAOIMask, {
            palette: ['white']
        }, m.labels.lblSelectedAOI, c.chkMaskAOI.getValue()));
        c.mapRight.layers().set(INDEX_MASK_AOI, ui.Map.Layer(eeObjectAOIMask, {
            palette: ['white']
        }, m.labels.lblSelectedAOI, c.chkMaskAOI.getValue()));

        var columnsPrefix = ['2001_2015', '2004_2019', '2008_2023'];
        var layerTypes = [periodItems[0], periodItems[1], periodItems[2]];

        // If a custom asset was loaded call precalculate function to calculate stats
        var ftcAux;
        if (m.precalculated) {
            ftcAux = m.ftcAOI.map(function (f) {
                return ee.Feature(null).copyProperties(f);
            });
        } else {
            print('Calculating stats on the fly')
            // Calculate all statistics required for info panel
            ftcAux = mdlPrecalculation.precalculate(m.ftcAOI);
        }

        c.lblNameValue.setValue(m.ftcAOI.first().get('name').getInfo());
        c.lblAreaValue.setValue(formatNumber(m.ftcAOI.first().get('area_ha').getInfo(), 0));

        m.evalSet["stats"] = true;

        ftcAux.first().evaluate(function (ef, error) {
            delete m.evalSet["stats"];
            if (Object.keys(m.evalSet).length === 0) {
                handleEvaluating(false);
            }

            if (ef) {
                m.ef = ef;

                var periodLeft = c.selLeftPeriods.getValue();
                var ll = c.selLeftLayers.getValue();

                var periodRight = c.selRightPeriods.getValue();
                var lr = c.selRightLayers.getValue();

                var entryLeft = m.imagesOptions[periodLeft][ll];
                var entryRight = m.imagesOptions[periodRight][lr];

                generateChart(entryLeft, c.pnlLeftChart, ll);
                generateChart(entryRight, c.pnlRightChart, lr);

                var headerSummary = [{
                    type: 'string',
                    label: m.labels.lblPeriod,
                    role: 'domain',
                },
                {
                    type: 'number',
                    label: 'MLS30',
                    role: 'data',
                },
                {
                    type: 'number',
                    label: 'HiLPD',
                    role: 'data',
                },
                {
                    type: 'number',
                    label: 'Trends.Earth',
                    role: 'data',
                }, {
                    type: 'number',
                    label: 'JRC',
                    role: 'data',
                }, {
                    type: 'number',
                    label: 'FWv2 Priority Mode',
                    role: 'data',
                }, {
                    type: 'number',
                    label: 'FWv2 Balance Mode',
                    role: 'data',
                }, {
                    type: 'number',
                    label: 'FWv2 Broad Detection',
                    role: 'data',
                },];

                var dtDecliningSummary = [];
                dtDecliningSummary.push(headerSummary);


                var totalArea =
                    ef.properties['lpd_0_2001_2015_TE'] +
                    ef.properties['lpd_1_2001_2015_TE'] +
                    ef.properties['lpd_2_2001_2015_TE'] +
                    ef.properties['lpd_3_2001_2015_TE'] +
                    ef.properties['lpd_4_2001_2015_TE'] +
                    ef.properties['lpd_5_2001_2015_TE'];


                // Declining + Moderate decline
                columnsPrefix.map(function (cat, i) {
                    var v0 = (ef.properties['lpd_1_' + cat + '_MLS'] + ef.properties['lpd_2_' + cat + '_MLS']) * 100 / totalArea;
                    var v1 = (ef.properties['lpd_1_' + cat + '_CBAS'] + ef.properties['lpd_2_' + cat + '_CBAS']) * 100 / totalArea;
                    var v2 = (ef.properties['lpd_1_' + cat + '_TE'] + ef.properties['lpd_2_' + cat + '_TE']) * 100 / totalArea;
                    var v3 = (ef.properties['lpd_1_' + cat + '_JRC'] + ef.properties['lpd_2_' + cat + '_JRC']) * 100 / totalArea;
                    var v4 = (ef.properties['lpd_1_' + cat + '_FWv2_PRM'] + ef.properties['lpd_2_' + cat + '_FWv2_PRM']) * 100 / totalArea;
                    var v5 = (ef.properties['lpd_1_' + cat + '_FWv2_BAM'] + ef.properties['lpd_2_' + cat + '_FWv2_BAM']) * 100 / totalArea;
                    var v6 = (ef.properties['lpd_1_' + cat + '_FWv2_BRD'] + ef.properties['lpd_2_' + cat + '_FWv2_BRD']) * 100 / totalArea;
                    dtDecliningSummary.push([layerTypes[i],
                    Math.round(v0 * 100) / 100,
                    Math.round(v1 * 100) / 100,
                    Math.round(v2 * 100) / 100,
                    Math.round(v3 * 100) / 100,
                    Math.round(v4 * 100) / 100,
                    Math.round(v5 * 100) / 100,
                    Math.round(v6 * 100) / 100,
                    ]);
                });

                var chtDecliningSummary = ui
                    .Chart(dtDecliningSummary)
                    .setChartType('Table')
                    .setOptions({
                        title: m.labels.lblDecliningSummary,
                        pageSize: 100,
                    });

                c.pnlCharts.widgets().add(ui.Label(m.labels.lblDecliningSummary));
                c.pnlCharts.widgets().add(chtDecliningSummary);

                var dtAllProducts = [];

                var header = [{
                    type: 'string',
                    label: m.labels.lblProduct,
                    role: 'domain',
                }, {
                    type: 'number',
                    label: m.lv.lpd.names[0],
                    role: 'data',
                }, {
                    type: 'number',
                    label: m.lv.lpd.names[1],
                    role: 'data',
                }, {
                    type: 'number',
                    label: m.lv.lpd.names[2],
                    role: 'data',
                }, {
                    type: 'number',
                    label: m.lv.lpd.names[3],
                    role: 'data',
                }, {
                    type: 'number',
                    label: m.lv.lpd.names[4],
                    role: 'data',
                }, {
                    type: 'number',
                    label: m.lv.lpd.names[5],
                    role: 'data',
                },];

                // Split Product from Period into two columns: Product | Period.
                var headerAll = header.slice(0);
                headerAll.splice(1, 0, {
                    type: 'string',
                    label: m.labels.lblPeriod,
                    role: 'data',
                });

                dtAllProducts.push(headerAll);


                function createBarChart(product, name) {

                    var dt = [];
                    dt.push(header);

                    columnsPrefix.map(function (cat, i) {
                        var v0 = ef.properties['lpd_0_' + cat + product];
                        var v1 = ef.properties['lpd_1_' + cat + product];
                        var v2 = ef.properties['lpd_2_' + cat + product];
                        var v3 = ef.properties['lpd_3_' + cat + product];
                        var v4 = ef.properties['lpd_4_' + cat + product];
                        var v5 = ef.properties['lpd_5_' + cat + product];

                        dt.push([layerTypes[i], v0, v1, v2, v3, v4, v5]);
                        dtAllProducts.push([name, layerTypes[i], Math.round(v0), Math.round(v1), Math.round(v2), Math.round(v3), Math.round(v4), Math.round(v5)]);

                    });

                    var cht = ui
                        .Chart(dt)
                        .setChartType('BarChart')
                        .setOptions({
                            title: name,
                            width: 600,
                            height: 400,
                            legend: {
                                position: 'top',
                                maxLines: 3
                            },
                            bar: {
                                groupWidth: '75%'
                            },
                            //isStacked: 'relative',
                            isStacked: 'percent',
                            colors: m.lv.lpd.vis.palette,
                        });

                    c.pnlCharts.widgets().add(cht);
                }

                createBarChart('_MLS', 'ML30 30m (ha)');
                createBarChart('_CBAS', 'HiLPD 30m (ha)');
                createBarChart('_TE', 'Trends.Earth 250m (ha)');
                createBarChart('_JRC', 'JRC 250m (ha)');
                createBarChart('_FWv2_PRM', 'FWv2 Priority Mode 250m (ha)');
                createBarChart('_FWv2_BAM', 'FWv2 Balance Mode 250m (ha)');
                createBarChart('_FWv2_BRD', 'FWv2 Broad Detection 250m (ha)');

                var chtAllProducts = ui
                    .Chart(dtAllProducts)
                    .setChartType('Table')
                    .setOptions({
                        title: '',
                        legend: {
                            position: 'none'
                        },
                        pageSize: 100,
                    });
                c.pnlCharts.widgets().add(ui.Label(m.labels.lblCompleteStatistics));
                c.pnlCharts.widgets().add(chtAllProducts);

            } else {
                c.lblMessages.setValue(error);
            }

        }); // end function evaluate





    };

    // Load charts for container
    var handleClickSelectContainer = function () {
        m.precalculated = true;
        resetLevelsSelects();
        m.levelAOI = m.labels.lblLevel0;
        m.ftcAOI = ftc0;
        showInfoAOI();
    };

    c.btnSelectContainer.onClick(handleClickSelectContainer);



    /*******************************************************************************
     * Initialize *
     ******************************************************************************/

    c.selLeftLayers.setValue(c.selLeftLayers.items().get(0), true);
    c.selRightLayers.setValue(c.selRightLayers.items().get(1), true);

    // Provinces names for dropdown
    m.names1 = ftc1.aggregate_array('ADM1_NAME').getInfo();
    m.codes1 = ftc1.aggregate_array('ADM1_CODE').getInfo();
    m.siLevel1 = [];
    for (var i = 0; i < m.names1.length; i++) {
        m.siLevel1.push({
            label: m.names1[i],
            value: m.codes1[i]
        });
    }
    m.siLevel1.sort(sortByLabel);
    c.selLevel1.items().reset(m.siLevel1);

    handleClickSelectContainer(); //  show global statistics


}