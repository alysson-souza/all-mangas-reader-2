/**
 * Update the manifest.json file from dist folder to create a releasable extension : 
 * Options are : 
 *  -version x : number that will be added to the current version number (if current version is 2.0.0 and x is 67, generated version will be 2.0.0.67). If version is specified, the generated extension will be supposed to update on the beta channel and "Beta" will be added to the extension name
 *  -chrome : if option is present, manifest will be adapted for chrome needs
 *  -firefox : if option is present, manifest will be adapted for firefox needs
 */
const fs = require('fs');
const path = require('path');
let fileName = path.join(__dirname, '../dist/manifest.json');
let ext = require(fileName);

// update file entries
let isBeta = false;
if (process.argv.includes("-version")) {
    let inc = process.argv[process.argv.findIndex(el => el === "-version") + 1];
    ext.version = ext.version + "." + inc;
    ext.name = ext.name + " Beta";
    isBeta = true;
}

if (process.argv.includes("-chrome")) {
    // Chrome public key
    ext.key = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDFE73kwUiPfxcBtTkkkboktSCXCrDxMWvYSO72IabK3Q9pqvkEcViyFcuj6mpztx55kYhwFT+ntasZZiNgzhxkjc9zEuHopyrg+/S2tgGa7ueZ+P8s3IMOeEWj9Mqw2qyvPoZ508Q6FwrGjU6rZAhBtS5dzhibkFxRQc9Yej2ppQIDAQAB"
    if (!isBeta) {
        ext.update_url = "https://release.allmangasreader.com/update/chrome.xml"
    } else {
        ext.update_url = "https://release.allmangasreader.com/update/chrome-beta.xml"
    }
} else if (process.argv.includes("-firefox")) {
    ext.applications = ext.applications || {}
    if (!isBeta) {
        ext.applications.gecko = {
            "id": "master@allmangasreader.com" //no update url, distributed on AMO
        }
    } else {
        ext.applications.gecko = {
            "id": "beta@allmangasreader.com",
            "update_url": "https://release.allmangasreader.com/update/firefox-beta.json"
        }
    }
}

fs.writeFile(fileName, JSON.stringify(ext, null, 2), function (err) {
    if (err) return console.log(err);
    console.log('Manifest file updated.');
});