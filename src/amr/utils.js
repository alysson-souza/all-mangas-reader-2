import i18n from './i18n';
import axios from 'axios';
/**
 * Test if current browser is Firefox
 * - used to display icons in browser (Firefix supports animated svg, chrome does not)
 */
export function isFirefox() {
    // Firefox 1.0+ (tested on Firefox 45 - 53)
    return typeof InstallTrigger !== 'undefined';
}

/**
 * Test if current browser is Firefox on Android
 */
export function isFirefoxAndroid() {
    return isFirefox() && navigator.userAgent.indexOf("Android") > -1
}

/**
 * Format manga name to test similarities
 * @param {*} name
 */
export function formatMgName(name) {
    if (name == undefined || name == null || name == "null")
        return "";
    return name.trim().replace(/\s/g, "")/*.replace(/[^0-9A-Za-z]/g, '') // DO NOT Replace non alpha char so UTF8 works*/
               .toLocaleLowerCase();
}

/**
 * Test if an url match an url pattern containing wildcards
 * @param {*} str a domain name
 * @param {*} rule
 */
export function matchDomain(str, rule) {
    if (rule == 'komga') {
        rule = new URL(AMR_STORE.state.options.komgaUrl).host
    }
    if (rule == 'tachidesk') {
        rule = new URL(AMR_STORE.state.options.tachideskUrl).host
    }
    let doMatch = new RegExp("^" + rule.replace(/\*/g, '.*') + "$").test(str)
    return doMatch
}

/**
 * Test if an url matches a mirror implementation
 * Return the mirror description of the matched mirror, null if none
 * @param {*} url of the current page
 */
export function currentPageMatch(url) {
    let host = extractHostname(url)
    for (let mir of window['AMR_STORE'].state.mirrors.all) {
        if (mir.activated && mir.domains) {
            let wss = mir.domains;
            for (let u of wss) {
                if (matchDomain(host, u)) {
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
    if (window['AMR_STORE'].state.options.debug === 1) {
        let t = new Date()
        console.log(t.getHours() + ':' + t.getMinutes() + ':' + t.getSeconds() + ' ' + t.getMilliseconds() + ': ' + message);
    }
}

/**
 * 
 * @param {string} secret 
 * @param {string} id 
 * @param {string} filename 
 * @param {*} content 
 */
export async function gistDebug(secret, id, filename, content) {
    if(window['AMR_STORE'].state.options.gistDebugEnabled === 0) return
    if(secret && secret !== '' && id && id !== '') return
    const ax = axios.create({
        baseURL: 'https://api.github.com/',
        headers: {
            'Authorization': `Bearer ${secret}`,
            'Cache-Control': 'no-cache'
        }
        });
    const request = await ax.get(`gists/${id}?cache=${Date.now()}`).catch(debug)
    const data = request.data
    let stringContent;
    if(data.files[filename]) {
        const parsedContent = JSON.parse(data.files[filename].content)
        parsedContent.push(content)
        stringContent = JSON.stringify(parsedContent, null, 2)
    } else {
        data.files[filename] = { content: [] }
        data.files[filename].content.push(content)
        stringContent = JSON.stringify(data.files[filename].content, null, 2)
    }
    await ax.patch(`gists/${id}`, { files: { [filename] : { content: stringContent } } } ).catch(debug)
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
export function extractHostname(url) {
    let uid = new URL(url)
    return uid.host
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
export function afterHostURL(url) {
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
export function mangaKey(url, forcedmirror, toconcat) {
    if (!url) {
        console.error("A manga key has been requested for undefined url, it will be melted in your database with other mangas with same issue, check the implementation of the mirror where your read this manga.")
        return "_no_key_" // should not happen !
    }

    let mstr = "unknown" // should never be unknown. Old domains need to be kept in domains description in the implementations
    if (forcedmirror !== undefined) {
        mstr = safename(forcedmirror)
    } else {
        let host = extractHostname(url);
        // look for mirror implementation matching this root domain
        let mirror = window['AMR_STORE'].state.mirrors.all.find(
            mir => mir.domains.findIndex(
                ws => matchDomain(host, ws)
            ) !== -1
        )
        if (mirror) mstr = safename(mirror.mirrorName)
    }

    return mstr + "/" + afterHostURL(url) + (toconcat !== undefined ? "_" + toconcat : "")
}

function safename(name) {
    if (name == undefined || name == null || name == "null")
        return "";
    return name.trim().replace(/[^0-9A-Za-z]/g, '').toLowerCase();
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
/**
 * List of supported languages in AMR, some are not traditional language codes
 * Multiple codes can match a same language, in this case, the entry is a list of
 * codes matching a language
 * Each code must have a css rule in flags.css to display the right flag for the language code
 * and a message code to display the language name
 */
export const languages = [
    ["ar", "sa"], "bd", "bg", "ct", "cn", "hk", "cz", "dk", "nl", ["en", "gb"], "ph", "fi", "fr", "de", "gr", "hu", "id", "it", "jp", "kr", "my", "mn", "ir", "pl", "br", "pt", "ro", "ru", "rs", "es", "mx", "se", "th", "tr", "ua", "vn"
]

export function getUnifiedLang(lang) {
    if (languages.includes(lang)) return lang
    for (let l of languages) {
        if (Array.isArray(l) && l.includes(lang)) return l[0]
    }
    return undefined
}

export function readLanguage(manga) {
    if (manga.language !== undefined) {
        return getUnifiedLang(manga.language)
    }

    const mirror = window['AMR_STORE'].state.mirrors.all.find(mir => mir.mirrorName === manga.mirror);
    if (!mirror) {
        return undefined;
    }

    return mirror.languages.split(",").length > 1 ? "aa" : getUnifiedLang(mirror.languages);
}

export function arrayToObject(array, keyField) {
    return array.reduce((obj, item) => {
        obj[item[keyField]] = item
        return obj
    }, {});
}

export function objectMapToArray(obj) {
    const data = [];
    Object.keys(obj).forEach(key => data.push(obj[key]))
    return data;
}

export function batchProps(obj, batchSize) {
    const batches = [];

    let i = 0;
    let batch = {};

    Object.keys(obj).forEach(key => {
        batch[key] = obj[key];
        i++;
        if (i >= batchSize) {
            batches.push(batch)
            i = 0;
            batch = {};
        }
    })

    return batches;
}

/**
 * MangaDex structure
 * {
 *  gb: [ ["121 - ", "https://mangadex.org/chapter/847019" ], [...]],
 *  br: [ ["121 - ", "https://mangadex.org/chapter/847019"], [...]],
 * }
 *
 * @param listChaps {[]|{}|undefined}
 * @return {boolean}
 */
export function isMultiLanguageList(listChaps) {
    return listChaps !== undefined && !Array.isArray(listChaps);
}


/**
 * check if we are in a pause case (if pause for a week option is checked,
 * we check updates only during 2 days (one before and one after)
 * around each 7 days after last chapter found)
 * @param mg
 * @param {{ stopupdateforaweek: number }} options
 * @return {boolean}
 */
export const shouldCheckForUpdate = (mg, options) => {
    if (!mg.upts || options.stopupdateforaweek !== 1) {
        // No update time or stopupdateforaweek is not enabled
        return true;
    }

    const day = 1000 * 60 * 60 * 24;
    const week = day * 7;
    // number of weeks since last update
    const nbweeks = Math.floor((Date.now() - mg.upts) / week) + 1;

    // check if we are in the gap between minus one day to plus one day compared to nbweeks weeks after last update
    const shouldUpdate = mg.upts + week * nbweeks - day <= Date.now() && Date.now() <= mg.upts + week * nbweeks + day;

    if (shouldUpdate) {
        debug("Manga " + mg.key + " has been updated less than " + nbweeks + " ago. We are in the minus one day to plus one day gap for this week number. We update the chapters list.")
    } else {
        debug("Manga " + mg.key + " has been updated less than " + nbweeks + " week ago. We are NOT in the minus one day to plus one day gap for this week number. We do not update the chapters list.")
    }

    return shouldUpdate
};

/**
 * Convert language to country
 * @param {String} langs language 
 */
 export function mdFixLang(langs) {
    const results = []
    for(const lang of langs.split(',')) {
        if(lang === 'pt-br') results.push('br')
        else if(lang === 'es-la') results.push('mx')
        else if(lang === 'fa') results.push('ir')
        else if(lang === 'cs') results.push('cz')
        else if(lang === 'zh-hk') results.push('hk')
        else if(lang === 'zh') results.push('cn')
        else if(lang === 'uk') results.push('ua')
        else if(lang === 'vi') results.push('vn')
        else if(lang === 'he') results.push('il')
        else if(lang === 'ms') results.push('my')
        else if(lang === 'tl') results.push('ph')
        else if(lang === 'ja') results.push('jp')
        else if(lang === 'ko') results.push('kr')
        else if(lang === 'hi') results.push('in')
        else if(lang === 'bn') results.push('bd')
        else if(lang === 'sv') results.push('se')
        else if(lang === 'el') results.push('gr')
        else if(lang === 'sr') results.push('ba')
        else if(lang === 'da') results.push('dk')
        else if(lang === 'ca') results.push('ct')
        else if(lang === 'null' || lang === 'NULL') results.push('_United-Nations')
        else results.push(lang)
    }
    return results.join(',')
}

export const mdFixLangsList = ['pt-br', 'es-la', 'fa', 'cs', 'zh-hk', 'zh', 'uk', 'vi', 'he', 'ms', 'tl', 'ja', 'ko', 'hi', 'bn', 'sv', 'sv', 'el', 'sr', 'da', 'ca', 'null', 'NULL']
export const mdFixLangsListPrefix = mdFixLangsList.map(e => '_'+e)