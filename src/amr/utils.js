import store from '../store';

/**
 * Test if current browser is Firefox
 * - used to display icons in browser (Firefix supports animated svg, chrome does not)
 */
export function isFirefox() {
    // Firefox 1.0+ (tested on Firefox 45 - 53)
    return typeof InstallTrigger !== 'undefined';
}
/**
 * Format manga name to test similarities
 * @param {*} name 
 */
export function formatMgName(name) {
    if (name == undefined || name == null || name == "null")
        return "";
    return name.trim().replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

/**
 * Test if an url match an url pattern containing wildcards
 * @param {*} str 
 * @param {*} rule 
 */
const matchUrlWildCards = function(str, rule) {
    let doMatch = new RegExp("^" + rule.replace(/\*/g, '.*') + "$").test(str);
    // If pattern starts with http, try https too
    if (!doMatch && rule.indexOf("http://") == 0) {
        doMatch = new RegExp("^https://" + rule.substring(7).replace(/\*/g, '.*') + "$").test(str);
    }
    return doMatch;
}

/**
 * Test if an url matches a mirror implementation
 * Return the mirror description of the matched mirror, null if none
 * @param {*} url of the current page
 */
export function currentPageMatch(url) {
    for (let mir of store.state.mirrors.all) {
        if (mir.activated) {
            let wss = (typeof mir.webSites === 'object') ? mir.webSites : JSON.parse(wsloc[i].webSites);
            for (let u of wss) {
                if (matchUrlWildCards(url, u)) {
                    return mir;
                }
            }
        }
    }
    return null;
}