
var mdlPrecalculation = require('users/apacheta/lpd-demo:app-lpd/precalculation.js');


var sidsLevel0 = ee.FeatureCollection("projects/apacheta/assets/SIDS/SIDS_GAUL_ADM0"),
    sidsLevel1 = ee.FeatureCollection("projects/apacheta/assets/SIDS/SIDS_GAUL_ADM1");

var version = 'v1'; 

// Modify countryName and iso3 variables accordingly. Alternatively replace ftc0 and ftc1 variables with custom feature collections for boundaries
var countryName = 'Haiti';  // name to filter FAO GAUL collection
var iso3 = 'HTI'; // ISO to use in files and folders names

/* Change output assets folder accordingly */
var assetFolder = 'projects/apacheta-pislm/assets/UNCCD2026_' + iso3 + '/LPD/';

var ftc0 = sidsLevel0.filter(ee.Filter.eq('ADM0_NAME', countryName));
var ftc1 = sidsLevel1.filter(ee.Filter.eq('ADM0_NAME', countryName));

var sample = [
    { name: 'Precal_Level0', asset: ftc0 },
    { name: 'Precal_Level1', asset: ftc1 },
];

// CALCULATION AND EXPORT
sample.forEach(function (s) {
    var assetName = iso3 + '_LPD_' + s.name + '_' + version;

    Export.table.toAsset({
        collection: mdlPrecalculation.precalculate(s.asset),
        description: assetName,
        assetId: assetFolder + assetName,
    });
});


