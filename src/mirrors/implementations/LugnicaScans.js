if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Lugnica Scan",
        mirrorIcon: "lugnicascan.png",
        languages: "fr",
        domains: ["lugnica-scans.com"],
        home: "https://lugnica-scans.com/",
        chapter_url: /\/manga\/.*\/.*\/$/g,

        getMangaList: async function (search) {
            let res = []
            let resultPage = await amr.loadPage(`${this.home}/mangas/`, {
                nocache: true,
                preventimages: true
            })
            $("a.title", resultPage).each(function () {
                if ($(this).text().toLowerCase().indexOf(search.toLowerCase())) {
                    res.push([$(this).text(), $(this).attr("href")])
                }
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $('div.manga-chapter a:not([href$="/comments/"])', doc).each(function (index) {
                let chapNumber = $(this).children().first().text()
                let chapTitle = $(this).children().last().text()
                let title = chapNumber + (chapNumber != chapTitle ? " : " + chapTitle : "")
                res.push([title, $(this).attr("href")])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let serieLink = $("a#mangalink", doc)
            return {
                name: serieLink.text().trim(),
                currentMangaURL: serieLink.attr("href"),
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            $("div.forgen_reader_image img", doc).each(function () {
                res.push($(this).data("src"))
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("div.forgen_reader_image", doc).length > 0
        }
    })
}
