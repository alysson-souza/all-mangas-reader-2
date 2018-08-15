import browser from "webextension-polyfill";
import statsEvents from './stats-events';

/**
 * This file defines a function called on extension init which initialize version and check informations
 */

 /**
 * Gets the browser name
 *
 * @returns {string}
 */
var browserdetect = function() {
    var isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';
    return isOpera ? "Opera" :
            isFirefox ? "Firefox" :
            "Chrome"; // no good way to detect chrome browser in an extension
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
        statsEvents.trackInstall(curVersion, beta, browserdetect());
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