import { afterHostURL, debug, extractHostname, getUnifiedLang, matchDomain, urlwords } from "../amr/utils"
import { Mirror } from "../types/common"

/**
 * Return the path from a url (used for chapters url)
 */
export function chapPath(chap_url: string | undefined) {
    if (!chap_url) return chap_url
    return chap_url.split("/").slice(3).join("/") //new URL(chap_url).pathname
}

function safename(name: string | null | undefined) {
    if (name === undefined || name === null || name == "null") {
        return ""
    }

    return name
        .trim()
        .replace(/[^0-9A-Za-z]/g, "")
        .toLowerCase()
}

/**
 * Format manga name to test similarities
 * @param {*} name
 */
export function formatMangaName(name: string | null | undefined) {
    if (name === undefined || name === null || name === "null") {
        return ""
    }
    return name
        .trim()
        .replace(/\s/g, "") /*.replace(/[^0-9A-Za-z]/g, '') // DO NOT Replace non alpha char so UTF8 works*/
        .toLocaleLowerCase()
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
    return listChaps !== undefined && !Array.isArray(listChaps)
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
        return true
    }

    const day = 1000 * 60 * 60 * 24
    const week = day * 7
    // number of weeks since last update
    const nbweeks = Math.floor((Date.now() - mg.upts) / week) + 1

    // check if we are in the gap between minus one day to plus one day compared to nbweeks weeks after last update
    const shouldUpdate = mg.upts + week * nbweeks - day <= Date.now() && Date.now() <= mg.upts + week * nbweeks + day

    if (shouldUpdate) {
        debug(
            "Manga " +
                mg.key +
                " has been updated less than " +
                nbweeks +
                " ago. We are in the minus one day to plus one day gap for this week number. We update the chapters list."
        )
    } else {
        debug(
            "Manga " +
                mg.key +
                " has been updated less than " +
                nbweeks +
                " week ago. We are NOT in the minus one day to plus one day gap for this week number. We do not update the chapters list."
        )
    }

    return shouldUpdate
}

export function readLanguage(manga: any, mirrors: Mirror[]) {
    if (manga.language !== undefined) {
        return getUnifiedLang(manga.language)
    }

    const mirror = mirrors.find(mir => mir.mirrorName === manga.mirror)
    if (!mirror) {
        return undefined
    }

    return mirror.languages.split(",").length > 1 ? "aa" : getUnifiedLang(mirror.languages)
}

/**
 * Test if a chapter url matchs another pathname
 * Return n the number of matched pathname parts
 */
export function matchurl(url, paths) {
    let chps = urlwords(url)
    let res = chps.reduce((nb, path) => (paths.findIndex(p => path === p) >= 0 ? nb + 1 : nb), 0)
    return res
}
/**
 * Find the probable chapter from its url and list of chapters
 */
export function findProbableChapter(lastReadURL, list) {
    let lws = urlwords(lastReadURL)
    let max = 0
    let lstMax = []
    for (let arr of list) {
        let prob = matchurl(arr[1], lws)
        if (prob > max) {
            max = prob
            lstMax = [arr]
        } else if (prob === max) {
            lstMax.push(arr)
        }
    }
    if (lstMax.length === 1) return lstMax[0]
    return
}

interface MangaKeyParams {
    url: string | undefined
    mirror: any
    shouldConcat: any
    mirrors: Mirror[]
}

export function mangaKey({ url, mirror, shouldConcat, mirrors }: MangaKeyParams) {
    if (!url) {
        console.error(
            "A manga key has been requested for undefined url, it will be melted in your database with other mangas with same issue, check the implementation of the mirror where your read this manga."
        )
        return "_no_key_" // should not happen !
    }

    let mstr = "unknown" // should never be unknown. Old domains need to be kept in domains description in the implementations
    if (mirror !== undefined) {
        mstr = safename(mirror)
    } else {
        const host = extractHostname(url)
        // look for mirror implementation matching this root domain
        let mirror = mirrors.find(mir => mir.domains.some(ws => matchDomain(host, ws)))
        if (mirror) {
            mstr = safename(mirror.mirrorName)
        }
    }

    return mstr + "/" + afterHostURL(url) + (shouldConcat !== undefined ? "_" + shouldConcat : "")
}
