import browser from "webextension-polyfill";
import statsEvents from './stats-events';

/**
 * This file defines a function called on extension init which initialize version and check informations
 */

/**
 * Initialize AMR version and track version changes
 */
export default function () {
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
        statsEvents.trackInstall(curVersion, beta);
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