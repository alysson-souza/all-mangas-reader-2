/**
 * This file is exported to /backup/index.js
 * It renders a json file of the reading list
 * Just go to chrome-extensions://..../backup/index.html or firefox equivalent
 */
import store from "../store"

const exportFile = function () {
    let mgs = store.state.mangas.all
    mgs = mgs.map(mg => {
        let res = {
            m: mg.mirror,
            n: mg.name,
            u: mg.url,
            l: mg.lastChapterReadURL
        }
        if (mg.read !== 0) res.r = mg.read
        if (mg.update !== 1) res.p = mg.update
        if (mg.display !== 0) res.d = mg.display
        if (mg.layout !== 0) res.y = mg.layout
        if (mg.cats.length > 0) res.c = mg.cats
        if (mg.language !== undefined) res.g = mg.language
        return res
    })
    let exp = { mangas: mgs }

    //add bookmarks
    let bms = store.state.bookmarks.all
    bms = bms.map(bm => {
        let res = {
            m: bm.mirror,
            n: bm.name,
            u: bm.url,
            c: bm.chapUrl,
            h: bm.chapName,
            o: bm.note,
            t: bm.type
        }
        if (bm.type === "scan") {
            res.s = bm.scanUrl
            res.a = bm.scanName
        }
        return res
    })
    exp.bookmarks = bms
    // output formatted json
    document.write(JSON.stringify(exp, null, 2))
}

;(async function () {
    // Load options in store before everything
    await store.dispatch("getStateFromReference", {
        module: "mangas",
        key: "all",
        mutation: "setMangas"
    })
    await store.dispatch("getStateFromReference", {
        module: "bookmarks",
        key: "all",
        mutation: "setBookmarks"
    })
    /** output json file */
    exportFile()
})()
