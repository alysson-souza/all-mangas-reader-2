if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Demon",
        mirrorIcon: "manga-demon.png",
        canListFullMangas: false,
        languages: "en",
        domains: ["manga-demon.org"],
        home: "https://manga-demon.org",
        chapter_url: /^\/manga\/.+\/chapter\/.+/g,

        getMangaList: async function (search) {
            let res = []
            let self = this
            let doc = await amr.loadPage(this.home + "series?search=" + search, { nocache: true, preventimages: true })
            $(`a[href*="/manga/"]`, doc).each(function () {
                res.push([$(this).text().trim(), self.home + $(this).attr("href")])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this

            $("ul.chapter-list a", doc).each(function (index) {
                res.push([$(this).find("strong").text().trim(), self.home + $(this).attr("href")])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            const link = $("h1 a:first", doc)
            const name = link.text()
            return {
                name: name,
                currentMangaURL: this.home + link.attr("href"),
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            let self = this
            $("article center div img", doc).each(function (index) {
                const src = $(this).attr("src")
                if (!res.includes(src)) {
                    res.push(src)
                }
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("article center div img", doc).length > 0
        }
    })
}
