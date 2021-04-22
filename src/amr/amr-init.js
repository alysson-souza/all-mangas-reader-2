import browser from "webextension-polyfill";
import statsEvents from './stats-events';
import * as utils from './utils';
import storedb from './storedb';

/**
 * This file defines a function called on extension init which initialize version and check informations
 */

 /**
 * Do things when app is installed
 * @param {*} ancVersion
 * @param {*} curVersion
 */
let installApp = async function(curVersion) {
    // check if user language is in readable list of languages add it if not
    checkLangSet()
    return () => {}
}
/**
 * Do things when version is updated
 * @param {*} ancVersion
 * @param {*} curVersion
 */
let updateApp = async function(ancVersion, curVersion) {
    let afterCalls = []
    if (!versionAfter(ancVersion, "2.0.2.140")) { // if previous version is before 2.0.2.140
        // from this version, mirrors are hosted to mirrors.allmangasreader.com/v4
        // update localStorage to change stored url if necessary
        console.log("Update main repository url to v4")
        await window['AMR_STORE'].dispatch("updateRepository", {
            old_repo: "https://mirrors.allmangasreader.com/v3/",
            new_repo: "https://mirrors.allmangasreader.com/v4/"
        })
        console.log("Reinitialize mirrors entries")
        // request an update of mirrors lists
        window['AMR_STORE'].dispatch("updateMirrorsLists")
    }
    if (!versionAfter(ancVersion, "2.0.2.150")) { // if previous version is before 2.0.2.150
        // check if user language is in readable list of languages add it if not
        checkLangSet()
        // change category names New, Read, Unread and One Shots to the new ones (codes to be internationalized)
        await window['AMR_STORE'].dispatch("updateCategoryName", {oldname: "New", newname: "category_new"})
        await window['AMR_STORE'].dispatch("updateCategoryName", {oldname: "Read", newname: "category_read"})
        await window['AMR_STORE'].dispatch("updateCategoryName", {oldname: "Unread", newname: "category_unread"})
        await window['AMR_STORE'].dispatch("updateCategoryName", {oldname: "One Shots", newname: "category_oneshots"})
        // create languages categories
        afterCalls.push(async () => {await window['AMR_STORE'].dispatch("updateLanguageCategories")})
    }
    if (!versionAfter(ancVersion, "2.0.4")) { // if previous version is before 2.0.3
        afterCalls.push(async () => {
            let todel = []
            let mgs = await storedb.getMangaList()
            for (let mg of mgs) {
                let sl = mg.key.indexOf("/")
                let mirrorpart = mg.key.substring(0, sl)
                if (!mirrorpart.match(/^[0-9a-z]+$/)) {
                    todel.push(mg.key)
                }
            }
            for (let td of todel) {
                console.log("deleting manga key " + td + " from db due to 2.0.3 issue")
                storedb.deleteManga(td)
            }
            // reloads mangas
            console.log("Reloading mangas after running db update")
            await window['AMR_STORE'].dispatch('initMangasFromDB');
        })
    }
    if (versionAfter(ancVersion, "2.3.11")) { // Just checking if it exists for those who skip versions of AMR
        if (!window['AMR_STORE'].state.options.categoriesStates.find(cat => cat.name === 'category_disabled_mirrors')) {
            await await window['AMR_STORE'].dispatch("addNativeCategory", "category_disabled_mirrors")
        }
    }
    /**
     * Return a function wrapping all functions to call once all db is initialized
     */
    return async () => {
        for (let func of afterCalls) {
            await func()
        }
    }
}

let checkLangSet = function() {
    let curlang = navigator.language.slice(0,2);
    // is language supported ? --> pb, sometimes, language code does not match amr code... let it be
    if (utils.languages.reduce((arr, el) => {
            Array.isArray(el) ? arr.push(...el) : arr.push(el)
            return arr
        }, []).includes(curlang)) {
        let readLangs = window['AMR_STORE'].state.options.readlanguages;
        if (!readLangs.includes(curlang)) {
            console.log("Add language " + curlang + " to readable list of languages")
            window['AMR_STORE'].dispatch("addReadLanguage", curlang) // add the language
        }
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

    let afterLoading = () => {}

    if (manifest.name.indexOf("Beta") > 0) {
        beta = true;
        localStorage.beta = 1
    } else {
        localStorage.beta = 0
    }

    if (!ancVersion || curVersion !== ancVersion) {
        localStorage.version = curVersion;
        if (!ancVersion) {
            statsEvents.trackInstall(curVersion, beta, browserdetect());
            afterLoading = await installApp(curVersion)
        } else {
            statsEvents.trackUpdate(curVersion, beta, browserdetect());
            afterLoading = await updateApp(ancVersion, curVersion)
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
    return afterLoading
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
