if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Nani Scans",
        mirrorIcon: "naniscans.png",
        canListFullMangas: true,
        languages: "en",
        domains: ["naniscans.xyz"],
        home: "https://naniscans.xyz",
        chapter_url: /^\/chapters\/\/read\/.+$/g,
        disabled: true,
        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "/titles", { nocache: true, preventimages: true })
            let res = []
            let self = this
            $("a[href*='/titles/']", doc).each(function () {
                res.push([$(this).text(), self.home + $(this).attr("href")])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $("a[href*='/chapters/'][href*='/read']", doc).each(function (index) {
                res.push([$(this).text().trim(), self.home + $(this).attr("href")])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            var mgtitle = $("a[href*='/titles/']:first", doc)
            return {
                name: mgtitle.text(),
                currentMangaURL: this.home + mgtitle.attr("href"),
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let pages = amr.getVariable("pages", doc)
            return pages
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("div#chapter-container", doc).length > 0
        }
    })
}
