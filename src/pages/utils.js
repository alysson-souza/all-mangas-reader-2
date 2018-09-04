import * as amrutils from '../amr/utils'

export function hasNew(manga) {
    return (
        manga.read === 0 &&
        (manga.listChaps.length &&
            amrutils.chapPath(manga.lastChapterReadURL) !== amrutils.chapPath(manga.listChaps[0][1]))
    );
}

export function hasBeenRead(manga) {
    return (manga.listChaps.length &&
        amrutils.chapPath(manga.lastChapterReadURL) === amrutils.chapPath(manga.listChaps[0][1]));
}

export function displayFilterCats(manga, categories) {
    let include = false, exclude = false;
    let needInclude = false, needExclude = false;
    let incexc = (cat, include, exclude) => {
        return [(cat.state === "include") || include, (cat.state === "exclude") || exclude]
    }
    for (let cat of categories) {
        if (cat.type === "native") {
            if (cat.name === "category_new" && hasNew(manga))[include, exclude] = incexc(cat, include, exclude);
            if (cat.name === "category_read" && hasBeenRead(manga))[include, exclude] = incexc(cat, include, exclude);
            if (cat.name === "category_unread" && !hasBeenRead(manga))[include, exclude] = incexc(cat, include, exclude);
            if (cat.name === "category_oneshots" && manga.listChaps.length === 1)[include, exclude] = incexc(cat, include, exclude);
        }
        if (cat.type === 'language') {
            if (cat.name === amrutils.readLanguage(manga)) [include, exclude] = incexc(cat, include, exclude);
        }
        if (manga.cats && manga.cats.length && manga.cats.includes(cat.name))[include, exclude] = incexc(cat, include, exclude);
        if (cat.state === "include") needInclude = true;
        if (cat.state === "exclude") needExclude = true;
    }
    if (!needInclude && !needExclude) return true;
    else if (needInclude && !needExclude) return include;
    else if (!needInclude && needExclude) return !exclude;
    else return include && !exclude;
}
export function countUsed(category, mangas) {
    if (category.type === "native") {
        if (category.name === "category_new") return mangas.reduce((nb, mg) => hasNew(mg) ? nb + 1 : nb, 0);
        if (category.name === "category_read") return mangas.reduce((nb, mg) => hasBeenRead(mg) ? nb + 1 : nb, 0);
        if (category.name === "category_unread") return mangas.reduce((nb, mg) => !hasBeenRead(mg) ? nb + 1 : nb, 0);
        if (category.name === "category_oneshots") return mangas.reduce((nb, mg) => mg.listChaps.length === 1 ? nb + 1 : nb, 0);
    } else if (category.type === "language") {
        return mangas.reduce((nb, mg) => amrutils.readLanguage(mg) === category.name ? nb + 1 : nb, 0);
    } else {
        return mangas.reduce((nb, mg) => mg.cats.includes(category.name) ? nb + 1 : nb, 0);
    }
}
/** replace string inside brackets by html tag for icon */
export function convertIcons(input) {
    return input.replace(/\[mdi-(.+)\]/g,'<i aria-hidden="true" class="v-icon mdi mdi-$1"></i>');
}