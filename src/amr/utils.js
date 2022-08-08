import i18n from "./i18n"

/**
 * Test if current browser is Firefox
 * - used to display icons in browser (Firefix supports animated svg, chrome does not)
 */
export function isFirefox() {
    // Firefox 1.0+ (tested on Firefox 45 - 53)
    return typeof globalThis.InstallTrigger !== "undefined"
}

/**
 * Test if current browser is Firefox on Android
 */
export function isFirefoxAndroid() {
    return isFirefox() && navigator.userAgent.indexOf("Android") > -1
}

/**
 * Format manga name to test similarities
 * @deprecated
 * @param {*} name
 */
export function formatMgName(name) {
    if (name == undefined || name == null || name == "null") return ""
    return name
        .trim()
        .replace(/\s/g, "") /*.replace(/[^0-9A-Za-z]/g, '') // DO NOT Replace non alpha char so UTF8 works*/
        .toLocaleLowerCase()
}

/**
 * Tells in human language how much time has been spent since this ts
 * @param {*} ts
 */
export function lasttime(diffts) {
    let diff = Math.floor(diffts / 1000)
    if (diff < 0) diff = 0
    if (diff < 60) return i18n("options_seconds", diff)
    diff = Math.floor(diff / 60)
    if (diff < 60) return i18n("options_minutes", diff)
    diff = Math.floor(diff / 60)
    if (diff < 24) return i18n("options_hours", diff)
    diff = Math.floor(diff / 24)
    if (diff < 7) return i18n("options_days", diff)
    diff = Math.floor(diff / 7)
    return i18n("options_weeks", diff) //TODO months , years ?  --> not needed in AMR yet
}

/**
 * Convert language to country
 * @param {String} langs language
 */
export function mdFixLang(langs) {
    const results = []
    if (typeof langs !== "string") return "_United-Nations"
    for (const lang of langs.split(",")) {
        switch (lang) {
            case "pt-br":
                results.push("br")
                break
            case "es-la":
                results.push("mx")
                break
            case "fa":
                results.push("ir")
                break
            case "cs":
                results.push("cz")
                break
            case "zh-hk":
                results.push("hk")
                break
            case "zh":
                results.push("cn")
                break
            case "uk":
                results.push("ua")
                break
            case "vi":
                results.push("vn")
                break
            case "he":
                results.push("il")
                break
            case "ms":
                results.push("my")
                break
            case "tl":
                results.push("ph")
                break
            case "ja":
                results.push("jp")
                break
            case "ko":
                results.push("ko")
                break
            case "hi":
                results.push("in")
                break
            case "bn":
                results.push("bd")
                break
            case "sv":
                results.push("se")
                break
            case "el":
                results.push("gr")
                break
            case "sr":
                results.push("ba")
                break
            case "da":
                results.push("dk")
                break
            case "ca":
                results.push("ct")
                break
            case "null":
                results.push("_United-Nations")
                break
            case "NULL":
                results.push("_United-Nations")
                break
            default:
                results.push(lang)
                break
        }
    }
    return results.join(",")
}
export function mdFixLangKey(key) {
    return key.replace(/.*_(.*)$/, function (a, b) {
        return a.replace(b, "") + mdFixLang(b)
    })
}
export const mdFixLangsList = [
    "pt-br",
    "es-la",
    "fa",
    "cs",
    "zh-hk",
    "zh",
    "uk",
    "vi",
    "he",
    "ms",
    "tl",
    "ja",
    "ko",
    "hi",
    "bn",
    "sv",
    "sv",
    "el",
    "sr",
    "da",
    "ca",
    "null",
    "NULL"
]
export const mdFixLangsListPrefix = mdFixLangsList.map(e => "_" + e)
