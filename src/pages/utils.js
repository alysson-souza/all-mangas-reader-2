import * as amrutils from "../amr/utils"
import { chapPath } from "../shared/utils"

export function hasNew(manga) {
    return (
        manga.read === 0 &&
        manga.listChaps.length > 0 &&
        chapPath(manga.lastChapterReadURL) !== chapPath(manga.listChaps[0][1])
    )
}

export function hasBeenRead(manga) {
    return manga.listChaps.length && chapPath(manga.lastChapterReadURL) === chapPath(manga.listChaps[0][1])
}

export function displayFilterCats(manga, categories, mirror) {
    let include = false,
        exclude = false
    let needInclude = false,
        needExclude = false
    let incexc = (cat, include, exclude) => {
        return [cat.state === "include" || include, cat.state === "exclude" || exclude]
    }
    for (let cat of categories) {
        if (cat.type === "native") {
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
            if (cat.name === amrutils.readLanguage(manga)) [include, exclude] = incexc(cat, include, exclude)
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
export function countUsed(category, mangas) {
    if (category.type === "native") {
        if (category.name === "category_new") return mangas.reduce((nb, mg) => (hasNew(mg) ? nb + 1 : nb), 0)
        if (category.name === "category_read") return mangas.reduce((nb, mg) => (hasBeenRead(mg) ? nb + 1 : nb), 0)
        if (category.name === "category_unread") return mangas.reduce((nb, mg) => (!hasBeenRead(mg) ? nb + 1 : nb), 0)
        if (category.name === "category_oneshots")
            return mangas.reduce((nb, mg) => (mg.listChaps.length === 1 ? nb + 1 : nb), 0)
    } else if (category.type === "language") {
        return mangas.reduce((nb, mg) => (amrutils.readLanguage(mg) === category.name ? nb + 1 : nb), 0)
    } else {
        return mangas.reduce((nb, mg) => (mg.cats.includes(category.name) ? nb + 1 : nb), 0)
    }
}
/** replace string inside brackets by html tag for icon */
export function convertIcons(input) {
    return input.replace(/\[mdi-(.+)\]/g, '<i aria-hidden="true" class="v-icon mdi mdi-$1"></i>')
}

/**
 * Calculates color to colorize mangas entries in list depending on options and manga state
 * @param {*} manga
 * @param {*} param1
 * @param {*} light a parameter indicating how much lighter the color must be
 */
export function getColor(manga, hasNew, { colornotfollow, colornew, colorread }, light) {
    if (manga.read !== 0) return computeColorLight(colornotfollow, light)
    else if (hasNew) {
        return computeColorLight(colornew, light)
    } else {
        return computeColorLight(colorread, light)
    }
}

export function computeColorLight(color, light) {
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
 * Return true if we need a dark text
 * @param {} manga
 * @param {*} options
 */
export function darkText(manga, hasNew, { colornotfollow, colornew, colorread }) {
    if (manga.read !== 0) return isLight(colornotfollow)
    else if (hasNew) {
        return isLight(colornew)
    } else {
        return isLight(colorread)
    }
}

function isLight(colorname) {
    return colorname.indexOf("#l") > 0 || ["lime", "yellow"].includes(colorname)
}

export function isSmallDevice() {
    return amrutils.isFirefoxAndroid() && window.innerWidth <= 700
}

export function filterByText(manga, search) {
    if (search !== "") {
        return manga.name.toLowerCase().includes(search.toLowerCase())
    }
    return true
}
