import store from '../store';
import i18n from './i18n';

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
export function matchUrlWildCards(str, rule) {
    let doMatch = new RegExp("^" + rule.replace(/\*/g, '.*') + "$").test(str);
    // If pattern starts with http, try https too
    if (!doMatch && rule.indexOf("http://") == 0) {
        doMatch = new RegExp("^https://" + rule.substring(7).replace(/\*/g, '.*') + "$").test(str);
    }
    // If pattern starts with http, try // too
    if (!doMatch && rule.indexOf("http://") == 0) {
        doMatch = new RegExp("^" + rule.substring(5).replace(/\*/g, '.*') + "$").test(str);
    }
    // If pattern starts with https, try // too
    if (!doMatch && rule.indexOf("https://") == 0) {
        doMatch = new RegExp("^" + rule.substring(6).replace(/\*/g, '.*') + "$").test(str);
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
        if (mir.activated && mir.webSites) {
            let wss = (mir.webSites.length) ? mir.webSites : JSON.parse(mir.webSites);
            for (let u of wss) {
                if (matchUrlWildCards(url, u)) {
                    return mir;
                }
            }
        }
    }
    return null;
}
/**
 * Logs a message if debug mode
 */
export function debug(message) {
    if (store.state.options.debug === 1) {
        console.log(message);
    }
}
/**
 * Serialize a vuex object.
 * Doing that because content script is not vue aware, the reactive vuex object needs to be 
 * converted to POJSO to work in non vue environment (else it will be {})
 * @param {*} obj 
 */
export function serializeVuexObject(obj) {
    return JSON.parse(JSON.stringify(obj)) // For an unknown reason, better than Object.assign({}, obj) in Firefox
}
/**
 * Extract the full host name
 * @param {*} url 
 */
const extractHostname = function(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1 || url.indexOf("//") === 0) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}
/**
 * Extract the root domain of a url without subdomain
 * @param {*} url 
 */
const extractRootDomain = function(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}
/**
 * Extract the part of a url following the domain
 * @param {*} url 
 */
const afterHostURL = function(url) {
    var after;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("://") > -1 || url.indexOf("//") === 0) {
        after = url.split('/').splice(3).join("/");
    }
    else {
        after = url.split('/').splice(1).join("/");
    }
    return after;
}
/**
 * Calculate manga key for a url (just host name, without subdomain followed by url of manga)
 * @param {*} url 
 */
export function mangaKey(url) {
    if (!url) {
        console.error("A manga key has been requested for undefined url, it will be melted in your database with other mangas with same issue, check the implementation of the mirror where your read this manga.")
        return "_no_key_"; // should not happen !
    }
    let rootdomain = extractRootDomain(url);
    // look for mirror implementation matching this root domain
    let mirror = store.state.mirrors.all.find(
        mir => mir.webSites.findIndex(
            ws => ws.indexOf(rootdomain) >= 0
        ) !== -1
    );
    let mstr = "unknown" // should never be unknown. Old domains need to be kept in webSites description in the implementations
    if (mirror) mstr = this.formatMgName(mirror.mirrorName).toLowerCase()
    return mstr + "/" + afterHostURL(url);
}
/**
 * Tells in human language how much time has been spent since this ts
 * @param {*} ts 
 */
export function lasttime(diffts) {
    let diff = Math.floor( (diffts) / 1000 );
    if (diff < 0) diff = 0;
    if (diff < 60) return i18n("options_seconds", diff)
    diff = Math.floor(diff / 60);
    if (diff < 60) return i18n("options_minutes", diff)
    diff = Math.floor(diff / 60);
    if (diff < 24) return i18n("options_hours", diff)
    diff = Math.floor(diff / 24);
    if (diff < 7) return i18n("options_days", diff)
    diff = Math.floor(diff / 7);
    return i18n("options_weeks", diff) //TODO months , years ?  --> not needed in AMR yet  
}
const twodigits = function(i) {
    if (i < 10) return "0" + i;
    return i;
}
/**
 * Returns current date formatted
 */
export function fdate() {
    var d = new Date();
    return d.getFullYear() + "-" + twodigits(d.getMonth()+1) + "-" + twodigits(d.getDate()) + "_" +
    twodigits(d.getHours()) + "-" + twodigits(d.getMinutes()) + "-" + twodigits(d.getSeconds());
}
/**
 * Return the path from a url (used for chapters url)
 */
export function chapPath(chap_url) {
    if (!chap_url) return chap_url;
    return chap_url.split("/").slice(3).join("/")//new URL(chap_url).pathname
}
/**
 * Return the list of pathname elements 
 */
export function urlwords(url) {
    return url.split("/").slice(3)
}
/**
 * Test if a chapter url matchs another pathname
 * Return n the number of matched pathname parts
 */
export function matchurl(url, paths) {
    let chps = urlwords(url);
    let res = chps.reduce(
        (nb, path) => paths.findIndex(p => path === p) >= 0 ? nb + 1 : nb
    , 0)
    return res;
}
/**
 * Find the probable chapter from its url and list of chapters
 */
export function findProbableChapter(lastReadURL, list) {
    let lws = urlwords(lastReadURL);
    let max = 0;
    let lstMax = [];
    for (let arr of list) {
        let prob = matchurl(arr[1], lws);
        if (prob > max) {
            max = prob;
            lstMax = [arr];
        } else if (prob === max) {
            lstMax.push(arr);
        }
    }
    if (lstMax.length === 1) return lstMax[0];
    return;
}