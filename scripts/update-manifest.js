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
    if (!isBeta) {
        // Chrome public key
        ext.key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2auEKHQ6Te138RdBhkI0iaCAkCQIddSyMYebuy//9xgtvYlFOKo0eX7S1FYaAUTccU0ZfkJGWUvzXiXTJ9eoKl+Wh4YHw/Yn4wHotDzbKl/ekl2icgMAldxcahXd4gLaBdMkEh/rQPFInJlm4oRAfQhoFIQtD3eHFxrYk4+B65hVEVhtiKGVF3Q9JTLeGaWTnYB6pnw+ch+/4zUG8i0OYjehmzKCCVERRb5w3QGG8DowbMsRojPpjfdAvXK6phURKbbQXh3pXRo5GfXtkdObnTd6TBS7txGIPjY5FjbFvyVXw8VJRVTEWoZ2feG9X4WPLuLs6XMzhcHSB1fR2HVFgQIDAQAB"
        ext.update_url = "https://release.allmangasreader.com/update/chrome.xml"
    } else {
        // Chrome public key
        ext.key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwEXrIivz3obLG3bW6G+r3GJr+4OGo/QLWVRBwzO64Nnzlert7fAgZWT1suTchA5kc+nZRVwyE4cbi3HRSKcnMYFK1oQjq83XgeXD9uRee743P8S3Ek09TUecI/wYm1mi0r9khrBZgGIpO07Bj23/70VktYLBU4Sei8au2evcdJXcuNJ89LqwhagQGdfQGvN9RrAU/opk99Wn2OWjD6sYFhOMx/EBxgokJUeYHeBOmNNbyDrAoz8CkaEm2gqSRJ1AntoUfNgbwGtvmA4YYsR2jp8XMBQiPr75pE85t2I6spSDvIM0/uuH65cwcmBkrW3P4AohWD4DyCFThxQUjB534wIDAQAB"
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