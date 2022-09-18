if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga-Freak",
        canListFullMangas: false,
        mirrorIcon: "mangafreak.png",
        domains: ["w11.mangafreak.net", "w12.mangafreak.net", "w13.mangafreak.net"],
        languages: "en",
        home: "https://w13.mangafreak.net",
        chapter_url: /\/Read.*/g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "/Search/" + search, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(".manga_search_item h3 a", doc).each(function (index) {
                res.push([$(this).text(), self.home + $(this).attr("href")])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(".manga_series_list tbody tr", doc).each(function () {
                let elem = $(this).find("td:first a")
                res.push([elem.text(), self.home + elem.attr("href")])
            })
            res.reverse()
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mga = $("h1.title a", doc)
            return {
                name: mga
                    .text()
                    .toLowerCase()
                    .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
                currentMangaURL: this.home + mga.attr("href"),
                currentChapterURL: curUrl.split(/[?#]/)[0]
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            $(".slideshow-container img", doc).each(function () {
                res.push($(this).attr("src"))
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(".slideshow-container img", doc).length > 0
        }
    })
}
