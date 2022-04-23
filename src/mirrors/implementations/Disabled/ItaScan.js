if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "ItaScan",
        mirrorIcon: "itascan.png",
        languages: "it",
        disabled: true,
        domains: ["itascan.info"],
        home: "https://itascan.info/",

        getMangaList: async function (search) {
            let json = await amr.loadJson("https://itascan.info/json/manga/" + search + ".json", {
                post: true,
                nocache: true
            })
            let res = []
            for (let serie of json) {
                res.push([serie.text, "https://itascan.info" + serie.url])
            }
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $("table a[href^='/view/']", doc).each(function (index) {
                res.push([$(this).text(), "https://itascan.info" + $(this).attr("href")])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mg = $(".breadcrumb a[href^='/manga/']", doc)
            return {
                name: mg.text(),
                currentMangaURL: "https://itascan.info" + mg.attr("href"),
                currentChapterURL:
                    "https://itascan.info" + $(".breadcrumb select.selectpicker:first option:selected", doc).val()
            }
        },

        getListImages: async function (doc, curUrl) {
            $(".breadcrumb select.selectpicker:first option:selected")
            var res = []
            $(".breadcrumb select#page_manga option", doc).each(function (index) {
                res[res.length] = "https://itascan.info" + $(this).val()
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            let doc = await amr.loadPage(urlImg)
            var src = "https:" + $("#page img.open", doc).attr("src")
            $(image).attr("src", src)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("#page img.open", doc).length > 0
        }
    })
}
