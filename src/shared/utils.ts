import { AppManga, AppStore, Category, Mirror } from "../types/common"
import { AppLogger } from "./AppLogger"
import { AppOptions } from "./OptionStorage"
import { amrLanguages } from "../constants/language"

export function hasBeenRead(manga: AppManga) {
    return manga.listChaps.length && chapPath(manga.lastChapterReadURL) === chapPath(manga.listChaps[0][1])
}

export function hasNew(manga) {
    return (
        manga.read === 0 &&
        manga.listChaps.length > 0 &&
        chapPath(manga.lastChapterReadURL) !== chapPath(manga.listChaps[0][1])
    )
}

/** replace string inside brackets by html tag for icon */
export function convertIcons(input) {
    return input.replace(/\[mdi-(.+)\]/g, '<i aria-hidden="true" class="v-icon mdi mdi-$1"></i>')
}

export function computeColorLight(color: string, light: number) {
    let colorname = color
    if (color.indexOf("#") > 0) {
        let sp = color.split("#")
        colorname = sp[0]
        let isDark = sp[1].charAt(0) === "d"
        let nb = parseInt(sp[1].charAt(1))
        if (isDark) light -= nb
        else light += nb
    }
    if (light > 5) light = 5
    if (light < -4) light = -4
    return colorname + (light === 0 ? "" : light < 0 ? " darken-" + -light : " lighten-" + light)
}

/**
 * Calculates color to colorize mangas entries in list depending on options and manga state
 * light a parameter indicating how much lighter the color must be
 */
export function getColor(
    manga: AppManga,
    hasNew: boolean,
    { colornotfollow, colornew, colorread }: AppOptions,
    // a parameter indicating how much lighter the color must be
    light: number
) {
    if (manga.read !== 0) return computeColorLight(colornotfollow, light)
    else if (hasNew) {
        return computeColorLight(colornew, light)
    } else {
        return computeColorLight(colorread, light)
    }
}

function isLight(colorname: string) {
    return colorname.indexOf("#l") > 0 || ["lime", "yellow"].includes(colorname)
}

/**
 * Return true if we need a dark text
 */
export function darkText(manga: AppManga, hasNew: boolean, { colornotfollow, colornew, colorread }: AppOptions) {
    if (manga.read !== 0) return isLight(colornotfollow)
    else if (hasNew) {
        return isLight(colornew)
    } else {
        return isLight(colorread)
    }
}

/**
 * Return the path from a url (used for chapters url)
 */
export function chapPath(chap_url: string | undefined) {
    if (!chap_url) return chap_url
    return chap_url.split("/").slice(3).join("/") //new URL(chap_url).pathname
}

export const getUrlParts = url => url.split("/").slice(3)

/**
 * Extract the part of a url following the domain
 * @param {*} url
 */
export function afterHostURL(url) {
    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("://") > -1 || url.indexOf("//") === 0) {
        return url.split("/").splice(3).join("/")
    }
    return url.split("/").splice(1).join("/")
}

/**
 * Extract the full host name
 * @param {*} url
 */
function extractHostname(url) {
    return new URL(url).host
}

export function getUnifiedLang(lang) {
    if (amrLanguages.includes(lang)) {
        return lang
    }
    for (let l of amrLanguages) {
        if (Array.isArray(l) && l.includes(lang)) {
            return l[0]
        }
    }
    return undefined
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
 * Serialize a vuex object.
 * Doing that because content script is not vue aware, the reactive vuex object needs to be
 * converted to POJSO to work in non vue environment (else it will be {})
 * @param {*} obj
 */
export function serializeVuexObject(obj) {
    return JSON.parse(JSON.stringify(obj)) // For an unknown reason, better than Object.assign({}, obj) in Firefox
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
 */
export const shouldCheckForUpdate = (mg: AppManga, options: AppOptions, logger: AppLogger) => {
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
        logger.debug(
            "Manga " +
                mg.key +
                " has been updated less than " +
                nbweeks +
                " ago. We are in the minus one day to plus one day gap for this week number. We update the chapters list."
        )
    } else {
        logger.debug(
            "Manga " +
                mg.key +
                " has been updated less than " +
                nbweeks +
                " week ago. We are NOT in the minus one day to plus one day gap for this week number. We do not update the chapters list."
        )
    }

    return shouldUpdate
}

export function readLanguage(manga: AppManga, mirrors: Mirror[]) {
    if (manga.language !== undefined) {
        return getUnifiedLang(manga.language)
    }

    const mirror = mirrors.find(mir => mir.mirrorName === manga.mirror)
    if (!mirror) {
        return undefined
    }

    return mirror.languages.split(",").length > 1 ? "aa" : getUnifiedLang(mirror.languages)
}

export function displayFilterCats(manga: AppManga, categories: Category[], mirrors: Mirror[]) {
    let include = false,
        exclude = false
    let needInclude = false,
        needExclude = false
    let incexc = (cat, include, exclude) => {
        return [cat.state === "include" || include, cat.state === "exclude" || exclude]
    }
    for (let cat of categories) {
        if (cat.type === "native") {
            const mirror = mirrors.find(mir => mir.mirrorName === manga.mirror)
            if (cat.name === "category_new" && hasNew(manga)) [include, exclude] = incexc(cat, include, exclude)
            if (cat.name === "category_read" && hasBeenRead(manga)) [include, exclude] = incexc(cat, include, exclude)
            if (cat.name === "category_unread" && !hasBeenRead(manga))
                [include, exclude] = incexc(cat, include, exclude)
            if (cat.name === "category_oneshots" && manga.listChaps.length === 1)
                [include, exclude] = incexc(cat, include, exclude)
            if (cat.name === "category_disabled_mirrors" && mirror && mirror.disabled)
                [include, exclude] = incexc(cat, include, exclude)
        }
        if (cat.type === "language") {
            if (cat.name === readLanguage(manga, mirrors)) [include, exclude] = incexc(cat, include, exclude)
        }
        if (manga.cats && manga.cats.length && manga.cats.includes(cat.name))
            [include, exclude] = incexc(cat, include, exclude)
        if (cat.state === "include") needInclude = true
        if (cat.state === "exclude") needExclude = true
    }
    if (!needInclude && !needExclude) return true
    else if (needInclude && !needExclude) return include
    else if (!needInclude && needExclude) return !exclude
    else return include && !exclude
}

export function countUsed(category: Category, mangas: AppManga[], mirrors: Mirror[]) {
    if (category.type === "native") {
        if (category.name === "category_new") {
            return mangas.reduce((nb, mg) => (hasNew(mg) ? nb + 1 : nb), 0)
        }
        if (category.name === "category_read") {
            return mangas.reduce((nb, mg) => (hasBeenRead(mg) ? nb + 1 : nb), 0)
        }
        if (category.name === "category_unread") {
            return mangas.reduce((nb, mg) => (!hasBeenRead(mg) ? nb + 1 : nb), 0)
        }
        if (category.name === "category_oneshots") {
            return mangas.reduce((nb, mg) => (mg.listChaps.length === 1 ? nb + 1 : nb), 0)
        }
    } else if (category.type === "language") {
        return mangas.reduce((nb, mg) => (readLanguage(mg, mirrors) === category.name ? nb + 1 : nb), 0)
    } else {
        return mangas.reduce((nb, mg) => (mg.cats.includes(category.name) ? nb + 1 : nb), 0)
    }
}

/**
 * Test if a chapter url matchs another pathname
 * Return n the number of matched pathname parts
 */
export function matchurl(url, paths) {
    return getUrlParts(url).reduce((nb, path) => (paths.findIndex(p => path === p) >= 0 ? nb + 1 : nb), 0)
}

/**
 * Find the probable chapter from its url and list of chapters
 */
export function findProbableChapter(lastReadURL, list) {
    const urlParts = getUrlParts(lastReadURL)
    let max = 0
    let lstMax = []
    for (let arr of list) {
        let prob = matchurl(arr[1], urlParts)
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
    mirror?: string
    language?: string
    shouldConcat?: boolean
    rootState: AppStore
}

/**
 * Test if an url match an url pattern containing wildcards
 */
export function matchDomain(str: string, rule: string, store: AppStore) {
    if (rule == "komga") {
        rule = new URL(store.state.options.komgaUrl).host
    }
    if (rule == "tachidesk") {
        rule = new URL(store.state.options.tachideskUrl).host
    }
    return new RegExp("^" + rule.replace(/\*/g, ".*") + "$").test(str)
}

export function mangaKey({ url, mirror, shouldConcat, rootState }: MangaKeyParams) {
    if (!url) {
        console.error(
            "A manga key has been requested for undefined url, it will be melted in your database with other mangas with same issue, check the implementation of the mirror where your read this manga."
        )
        return "_no_key_" // should not happen !
    }

    const mirrors = rootState.state.mirrors.all

    let mstr = "unknown" // should never be unknown. Old domains need to be kept in domains description in the implementations
    if (mirror !== undefined) {
        mstr = safename(mirror)
    } else {
        const host = extractHostname(url)
        // look for mirror implementation matching this root domain
        let mirror = mirrors.find(mir => mir.domains.some(ws => matchDomain(host, ws, rootState)))
        if (mirror) {
            mstr = safename(mirror.mirrorName)
        }
    }

    return mstr + "/" + afterHostURL(url) + (shouldConcat !== undefined ? "_" + shouldConcat : "")
}
