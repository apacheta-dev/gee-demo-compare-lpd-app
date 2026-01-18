/** LPD Products */

// FAO-WOCAT primary mode 250m
var fw_img1_pri_mode = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_FWv2_2001_2015_World_Priority_Mode');
var fw_img2_pri_mode = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_FWv2_2004_2019_World_Priority_Mode');
var fw_img3_pri_mode = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_FWv2_2008_2023_World_Priority_Mode');

// FAO-WOCAT balance mode 250m
var fw_img1_bal_mode = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_FWv2_2001_2015_World_Balance_Mode');
var fw_img2_bal_mode = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_FWv2_2004_2019_World_Balance_Mode');
var fw_img3_bal_mode = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_FWv2_2008_2023_World_Balance_Mode');

// FAO-WOCAT broad detection 250m
var fw_img1_broad_detection = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_FWv2_2001_2015_World_Broad_Detection');
var fw_img2_broad_detection = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_FWv2_2004_2019_World_Broad_Detection');
var fw_img3_broad_detection = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_FWv2_2008_2023_World_Broad_Detection');

// JRC  250m
var jrc_img1 = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_JRC_2015');
var jrc_img2 = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_JRC_2019');
var jrc_img3 = ee.Image('projects/apacheta-lpd/assets/LPD_World/LPD_JRC_2023');

// FAO-WOCAT V2 30m
var LPD_FWv2_2000_2015_v1 = ee.Image("projects/apacheta-lpd/assets/LPDmosaics/LPD_FWv2_2000_2015_v1");
var LPD_FWv2_2004_2019_v1 = ee.Image('projects/apacheta-lpd/assets/LPDmosaics/LPD_FWv2_2004_2019_v1');
var LPD_FWv2_2008_2023_v1 = ee.Image('projects/apacheta-lpd/assets/LPDmosaics/LPD_FWv2_2008_2023_v1');

// HiLPD CBAS 30m
var LPD_2000_2015_99_1_01 = ee.Image("projects/ee-ldn-global-ndvi1/assets/smallisland/99_1_01_LPD_merge_2000_2015_v2"),
    LPD_2004_2019_99_1_01 = ee.Image("projects/ee-ldn-global-ndvi1/assets/smallisland/99_1_01_LPD_merge_2004_2019_v2"),
    LPD_2008_2023_99_1_01 = ee.Image("projects/ee-ldn-global-ndvi1/assets/smallisland/99_1_01_LPD_merge_2008_2023_v2");

// Trends.Earth (Default) 250m
var te_2001_2015 = ee.Image("projects/fao-unccd/assets/TrendsEarth/02_Land_Productivity_Dynamics_using_TrendsEarth_method_2001_2015"),
    te_2004_2019 = ee.Image("projects/fao-unccd/assets/TrendsEarth/06_Land_Productivity_Dynamics_using_TrendsEarth_method_2004_2019"),
    te_2008_2023 = ee.Image("projects/fao-unccd/assets/TrendsEarth/11_Land_Productivity_Dynamics_using_TrendsEarth_method_2008_2023");


var lpdSources = {
    'Baseline 2001-2015': {
        'JRC':
        {
            imgMap: jrc_img1,
            scale: 250,
            suffix: '2001_2015_JRC'

        },
        'FWv2 Priority Mode':
        {
            imgMap: fw_img1_pri_mode,
            scale: 250,
            suffix: '2001_2015_FWv2_PRM'
        },
        'FWv2 Balance Mode':
        {
            imgMap: fw_img1_bal_mode,
            scale: 250,
            suffix: '2001_2015_FWv2_BAM'
        },
        'FWv2 Broad Detection':
        {
            imgMap: fw_img1_broad_detection,
            scale: 250,
            suffix: '2001_2015_FWv2_BRD'
        },
        'ML30-LPD  (Mixed Landsat 30m LPD)':
        {
            imgMap: LPD_FWv2_2000_2015_v1,
            scale: 30,
            suffix: '2001_2015_MLS'
        },
        'HiLPD-SIDS':
        {
            imgMap: LPD_2000_2015_99_1_01,
            scale: 30,
            suffix: '2001_2015_CBAS'
        },
        'Trends.Earth':
        {
            imgMap: te_2001_2015,
            scale: 250,
            suffix: '2001_2015_TE'
        }

    },
    'Reporting Period 1 2004-2019': {
        'JRC':
        {
            imgMap: jrc_img2,
            scale: 250,
            suffix: '2004_2019_JRC'

        },
        'FWv2 Priority Mode':
        {
            imgMap: fw_img2_pri_mode,
            scale: 250,
            suffix: '2004_2019_FWv2_PRM'
        },
        'FWv2 Balance Mode':
        {
            imgMap: fw_img2_bal_mode,
            scale: 250,
            suffix: '2004_2019_FWv2_BAM'
        },
        'FWv2 Broad Detection':
        {
            imgMap: fw_img2_broad_detection,
            scale: 250,
            suffix: '2004_2019_FWv2_BRD'
        },
        'ML30-LPD  (Mixed Landsat 30m LPD)':
        {
            imgMap: LPD_FWv2_2004_2019_v1,
            scale: 30,
            suffix: '2004_2019_MLS'

        },
        'HiLPD-SIDS':
        {
            imgMap: LPD_2004_2019_99_1_01,
            scale: 30,
            suffix: '2004_2019_CBAS'
        },
        'Trends.Earth':
        {
            imgMap: te_2004_2019,
            scale: 250,
            suffix: '2004_2019_TE'
        }

    },
    'Reporting Period 2 2008-2023': {
        'JRC':
        {
            imgMap: jrc_img3,
            scale: 250,
            suffix: '2008_2023_JRC'

        },
        'FWv2 Priority Mode':
        {
            imgMap: fw_img3_pri_mode,
            scale: 250,
            suffix: '2008_2023_FWv2_PRM'
        },
        'FWv2 Balance Mode':
        {
            imgMap: fw_img3_bal_mode,
            scale: 250,
            suffix: '2008_2023_FWv2_BAM'
        },
        'FWv2 Broad Detection':
        {
            imgMap: fw_img3_broad_detection,
            scale: 250,
            suffix: '2008_2023_FWv2_BRD'
        },
        'ML30-LPD  (Mixed Landsat 30m LPD)':
        {
            imgMap: LPD_FWv2_2008_2023_v1,
            scale: 30,
            suffix: '2008_2023_MLS'

        },
        'HiLPD-SIDS':
        {
            imgMap: LPD_2008_2023_99_1_01,
            scale: 30,
            suffix: '2008_2023_CBAS'
        },
        'Trends.Earth':
        {
            imgMap: te_2008_2023,
            scale: 250,
            suffix: '2008_2023_TE'
        }
    },

};



// Configure images reducers
var processList = [];


var periods = Object.keys(lpdSources);

periods.forEach(function (periodKey) {

    var sources = Object.keys(lpdSources[periodKey]);

    // Calculate lc area for each year and product
    sources.forEach(function (sourceKey) {

        var source = lpdSources[periodKey][sourceKey];

        // cat: [0, 1, 2, 3, 4, 5]
        var colNamesLPDPeriod = [];
        [0, 1, 2, 3, 4, 5].forEach(function (catNumber) {
            colNamesLPDPeriod.push('lpd_' + catNumber + '_' + source.suffix);
        });

        var imgRenamedLPD = source.imgMap.unmask().eq([0, 1, 2, 3, 4, 5]).rename(colNamesLPDPeriod);
        var imgArea = imgRenamedLPD.multiply(ee.Image.pixelArea()).divide(10000);
        processList.push({
            name: 'p_lpd_' + source.suffix,
            image: imgArea,
            reducer: ee.Reducer.sum(),
            scale: source.scale
        });

        source.colNames = colNamesLPDPeriod;
    });
});

// For all features in the pFeatureCollection collection, precalculates area and process all tasks defined in processList
var precalculate = function (pFeatureCollection, pStats) {

    // Add area column
    var ftcStats = pFeatureCollection.map(function (f) {
        return f.set(
            'area_ha', f
                .geometry()
                .area({ 'maxError': 1 })
                .divide(10000)
        );
    });

    var image;
    for (var j = 0; j < processList.length; j++) {
        // include only desired stats 
        if (pStats === undefined || pStats.indexOf(processList[j].name) >= 0) {
            image = processList[j].image;
            ftcStats = image.reduceRegions({
                reducer: processList[j].reducer,
                scale: processList[j].scale,
                collection: ftcStats,
            });
        }
    }

    return ftcStats;
};


// Exports to use in app
exports.precalculate = precalculate;
exports.lpdSources = lpdSources;
