export function hasNew(manga) {
    return (
        manga.read === 0 &&
        (manga.listChaps.length &&
            manga.lastChapterReadURL !== manga.listChaps[0][1])
    );
}
export function hasBeenRead(manga) {
    return (manga.listChaps.length &&
        manga.lastChapterReadURL === manga.listChaps[0][1]);
}
export function displayFilterCats(manga, categories) {
    let include = false, exclude = false;
    let needInclude = false, needExclude = false;
    let incexc = (cat, include, exclude) => {
        return [(cat.state === "include") || include, (cat.state === "exclude") || exclude]
    }
    for (let cat of categories) {
        if (cat.type === "native") {
            if (cat.name === "New" && hasNew(manga))[include, exclude] = incexc(cat, include, exclude);
            if (cat.name === "Read" && hasBeenRead(manga))[include, exclude] = incexc(cat, include, exclude);
            if (cat.name === "Unread" && !hasBeenRead(manga))[include, exclude] = incexc(cat, include, exclude);
            if (cat.name === "One Shots" && manga.listChaps.length === 1)[include, exclude] = incexc(cat, include, exclude);
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
        if (category.name === "New") return mangas.reduce((nb, mg) => hasNew(mg) ? nb + 1 : nb, 0);
        if (category.name === "Read") return mangas.reduce((nb, mg) => hasBeenRead(mg) ? nb + 1 : nb, 0);
        if (category.name === "Unread") return mangas.reduce((nb, mg) => !hasBeenRead(mg) ? nb + 1 : nb, 0);
        if (category.name === "One Shots") return mangas.reduce((nb, mg) => mg.listChaps.length === 1 ? nb + 1 : nb, 0);
    } else {
        return mangas.reduce((nb, mg) => mg.cats.includes(category.name) ? nb + 1 : nb, 0);
    }
}