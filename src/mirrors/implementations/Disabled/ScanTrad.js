if (typeof registerMangaObject === "function") {
    registerMangaObject({
        disabled: true,
        mirrorName: "Scan Trad",
        mirrorIcon: "scantrad.png",
        languages: "fr",
        domains: ["scantrad.net"],
        home: "https://scantrad.net/",
        chapter_url: /^\/mangas\/.*\/[0-9]+.*$/g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://scantrad.net/", {
                nocache: true,
                preventimages: true,
                post: true,
                data: {
                    q: search
                }
            })
            let res = []
            $("a.recherche-g", doc).each(function (index) {
                res[index] = [$(".rgr-titre", $(this)).text(), "https://scantrad.net" + $(this).attr("href")]
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $("#chapitres div.chapsca", doc).each(function () {
                let url = $("a.hm-link", $(this)).attr("href")
                if (url.indexOf("/mangas") === 0) {
                    res[res.length] = [$("span.chl-num", $(this)).text().trim(), "https://scantrad.net" + url]
                }
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mangaUrl = $("a.logo_box", doc).attr("href")
            let mangaDoc = await amr.loadPage(mangaUrl, { nocache: true, preventimages: true })
            var mangaTitle = $(".titre", mangaDoc).contents().get(0).textContent
            return {
                name: mangaTitle,
                currentMangaURL: mangaUrl,
                currentChapterURL: $("#selectCh", doc).attr("href")
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            $(".main_img img", doc).each(function () {
                let url = $(this).attr("data-src")
                if (!url) {
                    return
                }
                if (url.indexOf("http") !== 0) url = "https://scan-trad.fr/" + url
                res.push(url)
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(".main_img img", doc).length > 0
        }
    })
}
