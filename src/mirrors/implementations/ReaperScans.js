if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Reaper Scans",
        mirrorIcon: "reaperscans.png",
        languages: "en",
        domains: ["reaperscans.com"],
        home: "https://reaperscans.com/",
        canListFullMangas: false,
        chapter_url: /^\/comics\/.+\/chapters\/.+chapter/g,

        getMangaList: async function (search) {
            return []
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this

            $("li a[href*='/chapters/']", doc).each(function (index) {
                res.push([$("p:first", this).text().trim(), $(this).attr("href")])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            var mgtitle = $($("main p:first", doc)[0])
            return {
                name: mgtitle.text(),
                currentMangaURL: curUrl.split("/", 5).join("/"),
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            $("main img", doc).each(function (index) {
                res.push($(this).attr("src"))
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("main img", doc).length > 0
        }
    })
}
