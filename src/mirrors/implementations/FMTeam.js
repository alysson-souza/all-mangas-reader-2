if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "FM Team",
        mirrorIcon: "_base-icon.png",
        languages: "fr",
        domains: ["fmteam.fr"],
        home: "https://fmteam.fr",
        canListFullMangas: true,
        chapter_url: /\/read\/.*\/ch\/\w+#?\d*/g,

        getMangaList: async function (search) {
            let jsonSearch = await amr.loadJson(`${this.home}/api/search/${search}`)
            let res = jsonSearch.comics.map(mangaJson => {
                return [mangaJson.title, this.home + mangaJson.url]
            })
            return res
        },

        getListChaps: async function (urlManga) {
            const id = urlManga.split("/")[4]
            //TODO: handle multi language, not used yet by the mrirror
            let jsonSearch = await amr.loadJson(`${this.home}/api/comics/${id}`)
            let res = jsonSearch.comic.chapters.map(mangaJson => {
                return [mangaJson.full_title, this.home + mangaJson.url]
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let apiUrl = curUrl.replace("/read/", "/api/read/")
            let info = await amr.loadJson(apiUrl)
            return {
                name: info.comic.title,
                currentMangaURL: this.home + info.comic.url,
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            //https://fmteam.fr/read/one-punch-man/fr/ch/186
            let idManga = curUrl.split("/")[4]
            let idChap = curUrl.match(/ch\/(\w+)#?\d*$/)[1]
            //TODO handle language if needed
            let jsonRes = await amr.loadJson(`${this.home}/api/read/${idManga}/fr/ch/${idChap}`)
            return jsonRes.chapter.pages
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return curUrl.match(/ch\/(\w+)#?\d*$/) !== undefined
        }
    })
}
