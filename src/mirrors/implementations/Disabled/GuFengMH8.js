if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "GuFengMH8",
        canListFullMangas: false,
        mirrorIcon: "gufengmh8.png",
        languages: "cn",
        domains: ["gufengmh8.com"],
        home: "https://www.gufengmh8.com/",
        chapter_url: /^\/manhua\/.*\/(\d+).html$/g,
        disabled: true,

        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://www.gufengmh8.com/search/", {
                nocache: true,
                preventimages: true,
                type: "GET",
                dataType: "text",
                data: { keywords: search }
            })
            let res = []
            $("#contList li.item-lg > a:first-child", doc).each(function (index) {
                res.push([$(this).attr("title"), $(this).attr("href")])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $("#chapter-list-1 li a", doc).each(function (index) {
                res.push([$(this).text().trim(), "https://www.gufengmh8.com" + $(this).attr("href")])
            })
            return res.reverse()
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            var name = $(".title h1 a", doc).text()
            var nameurl = $(".title h1 a", doc).attr("href")
            let indsharp = curUrl.indexOf("#")
            var chapurl = curUrl.substr(0, indsharp >= 0 ? indsharp : curUrl.length)
            return {
                name: name.trim(),
                currentMangaURL: "https://www.gufengmh8.com" + nameurl,
                currentChapterURL: chapurl
            }
        },

        getListImages: async function (doc, curUrl) {
            let images = amr.getVariable("chapterImages", doc),
                path = amr.getVariable("chapterPath", doc)
            return images && images.map(name => "https://res.gufengmh8.com/" + path + name)
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("#images", doc).length > 0
        }
    })
}
