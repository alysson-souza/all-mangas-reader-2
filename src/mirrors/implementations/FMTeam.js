if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "FM Team",
        mirrorIcon: "_base-icon.png",
        languages: "fr",
        domains: ["fmteam.fr"],
        home: "https://fmteam.fr/",
        canListFullMangas: true,
        chapter_url: /^\/read\/+/g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://fmteam.fr/directory/", {
                nocache: true,
                preventimages: true
            })
            let res = []
            $(".series .title a", doc).each(function () {
                res.push([$(this).text(), $(this).attr("href")])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $(".list .title a", doc).each(function () {
                res.push([$(this).text().trim(), $(this).attr("href")])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let links = $("h1.tbtitle a", doc)
            let seriesLink = $(links[0])
            let chapterLink = $(links[1])

            return {
                name: seriesLink.text().trim(),
                currentMangaURL: seriesLink.attr("href"),
                currentChapterURL: chapterLink.attr("href")
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            let pages = amr.getVariable("pages", doc)
            console.debug("Pages", pages)

            pages.forEach(page => res.push(page.url))
            // $(".main_img img", doc).each(function () {
            //     let url = $(this).attr("data-src")
            //     if (!url) {
            //         return
            //     }
            //     if (url.indexOf("http") !== 0) url = "https://scan-trad.fr/" + url
            //     res.push(url)
            // })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            let pages = amr.getVariable("pages", doc)
            return pages != undefined
        }
    })
}
