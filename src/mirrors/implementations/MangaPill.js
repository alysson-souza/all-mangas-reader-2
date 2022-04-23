if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Pill",
        mirrorIcon: "mangapill.png",
        languages: "en",
        domains: ["mangapill.com"],
        home: "https://mangapill.com",
        chapter_url: /^\/chapters\/.+$/g,

        getMangaList: async function (search) {
            let res = []
            let self = this

            let doc = await amr.loadPage(this.home + "/search?q=" + search + "&type=&status=", {
                nocache: true,
                preventimages: true
            })
            $(".mt-2 a", doc).each(function () {
                res.push([$(this).text(), self.home + $(this).attr("href")])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this

            $('a[href*="/chapters/"]', doc).each(function (index) {
                res.push([$(this).text(), self.home + $(this).attr("href")])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let parts = curUrl.split("/")
            let id = parts[4].split("-")[0]
            let slug = parts[5].split("-chapter-")[0]

            let mgUrl = this.home + "/manga/" + id + "/" + slug
            doc = await amr.loadPage(mgUrl, { nocache: true, preventimages: true })
            var mgtitle = $($("h1", doc)[0])
            return {
                name: mgtitle.text(),
                currentMangaURL: mgUrl,
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            $("picture img", doc).each(function (index) {
                res.push($(this).attr("data-src"))
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("picture img", doc).length > 0
        }
    })
}
