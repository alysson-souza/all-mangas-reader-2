if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Arang Scans",
        mirrorIcon: "arangscans.png",
        languages: "en",
        domains: ["arangscans.org"],
        home: "https://arangscans.org/",
        canListFullMangas: true,
        disabled: true,
        chapter_url: /^\/chapters\/.*\/.+$/g,

        getMangaList: async function (search) {
            const doc = await amr.loadPage(this.home + "titles", { nocache: true, preventimages: true })
            const res = []
            $("h4 > a", doc).each(function () {
                res.push([$(this).text(), "https://arangscans.org" + $(this).attr("href")])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            const doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            const res = []
            $("p > a:last-of-type", doc).each(function () {
                const url = "https://arangscans.org" + $(this).attr("href")
                res.push([$(this).text(), url])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            var mgtitle = $($("a.section", doc)[0])
            return {
                name: mgtitle.text(),
                currentMangaURL: "https://arangscans.org" + mgtitle.attr("href"),
                currentChapterURL: curUrl.split("/").slice(0, 5).join("/") + "/read"
            }
        },

        getListImages: async function (doc, curUrl) {
            const json = await amr.loadJson(curUrl.replace("read", "json"))
            return json.pages.map(page => "https://arangscans.org" + page.address)
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("img#page", doc).length > 0
        }
    })
}
