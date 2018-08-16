import browser from "webextension-polyfill";
import statsEvents from './stats-events';
import store from '../store';

/**
 * This file defines a function called on extension init which initialize version and check informations
 */

/**
 * Do things when version is updated
 * @param {*} ancVersion 
 * @param {*} curVersion 
 */
let updateApp = function(ancVersion, curVersion) {
    if (!versionAfter(ancVersion, "2.0.2.140")) { // if previous version is before 2.0.2.140
        // from this version, mirrors are hosted to mirrors.allmangasreader.com/v4
        // update localStorage to change stored url if necessary
        store.dispatch("updateRepository", {
            old_repo: "https://mirrors.allmangasreader.com/v3/", 
            new_repo: "https://mirrors.allmangasreader.com/v4/"
        })
    }
}

/**
 * Initialize AMR version and track version changes
 */
export default async function () {
    let manifest = browser.runtime.getManifest();

    let ancVersion = localStorage["version"];
    let curVersion = manifest.version;

    let url = manifest.homepage_url;
    let beta = false;
    
    if (manifest.name.indexOf("Beta") > 0) {
        beta = true;
    }

    if (!ancVersion || curVersion !== ancVersion) {
        localStorage.version = curVersion;
        if (!ancVersion) {
            statsEvents.trackInstall(curVersion, beta, browserdetect());
        } else {
            statsEvents.trackUpdate(curVersion, beta, browserdetect());
            updateApp(ancVersion, curVersion);
        }
    }
    if (beta) {
        browser.browserAction.setTitle({
            title: "All Mangas Reader Beta " + curVersion
        });
    } else {
        browser.browserAction.setTitle({
            title: "All Mangas Reader " + curVersion
        });
    }
}


 /**
 * Gets the browser name
 *
 * @returns {string}
 */
let browserdetect = function() {
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';
    return isOpera ? "Opera" :
            isFirefox ? "Firefox" :
            "Chrome"; // no good way to detect chrome browser in an extension
}

let isPositiveInteger = function(x) {
    // http://stackoverflow.com/a/1019526/11236
    return /^\d+$/.test(x);
}

/**
 * Compare two software version numbers (e.g. 1.7.1)
 * Returns:
 *
 *  0 if they're identical
 *  negative if v1 < v2
 *  positive if v1 > v2
 *  Nan if they in the wrong format
 *
 *  E.g.:
 *
 *  assert(version_number_compare("1.7.1", "1.6.10") > 0);
 *  assert(version_number_compare("1.7.1", "1.7.10") < 0);
 *
 *  "Unit tests": http://jsfiddle.net/ripper234/Xv9WL/28/
 *
 *  Taken from http://stackoverflow.com/a/6832721/11236
 */
let compareVersionNumbers = function(v1, v2){
    var v1parts = v1.split('.');
    var v2parts = v2.split('.');

    // First, validate both numbers are true version numbers
    function validateParts(parts) {
        for (var i = 0; i < parts.length; ++i) {
            if (!isPositiveInteger(parts[i])) {
                return false;
            }
        }
        return true;
    }
    if (!validateParts(v1parts) || !validateParts(v2parts)) {
        return NaN;
    }

    for (var i = 0; i < v1parts.length; ++i) {
        if (v2parts.length === i) {
            return 1;
        }

        if (v1parts[i] === v2parts[i]) {
            continue;
        }
        if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        return -1;
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

/**
 * Test if a version is after another
 * return true if version > totest
 */
let versionAfter = function(version, totest) {
    return compareVersionNumbers(version, totest) > 0
}
