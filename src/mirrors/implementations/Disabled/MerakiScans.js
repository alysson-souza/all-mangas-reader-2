if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "MerakiScans",
        canListFullMangas: true,
        mirrorIcon: "merakiscans.png",
        languages: "en",
        domains: ["merakiscans.com", "www.merakiscans.com"],
        home: "https://www.merakiscans.com/",
        chapter_url: /^\/(manga|manhua)\/.*\/.+$/g,
        disabled: true,

        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://merakiscans.com/manga/", { nocache: true, preventimages: true })
            res = []
            $("div#all div[id='listitem']", doc).each(function (ind) {
                res.push([
                    $(this).find("h1").text(),
                    "https://merakiscans.com" + $(this).find("a").attr("href").replace("/details/", "/manga/")
                ])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            // For some reason no https: is passed????
            if (!urlManga.includes("https:")) {
                urlManga = "https:" + urlManga
            }
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $("tr[id='chapter-head']", doc).each(function (index) {
                res[res.length] = [
                    $(this).find("td:first").text(),
                    "https://merakiscans.com" + $(this).attr("data-href")
                ]
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let name = $("h1[id='reader_text'] a", doc).text()
            let nameurl = "https://merakiscans.com" + $("h1[id='reader_text'] a", doc).attr("href") + "/"
            let currentChapter = amr.getVariable("currentChapter", doc)
            let chapurl = nameurl + currentChapter + "/"
            return {
                name: name,
                currentMangaURL: nameurl,
                currentChapterURL: chapurl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            let images = amr.getVariable("images", doc)
            images.forEach(image => {
                res.push(curUrl + "/" + image)
            })
            return res
        },

        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            let currentChapter = amr.getVariable("currentChapter", doc)

            return currentChapter !== undefined
        }
    })
}
