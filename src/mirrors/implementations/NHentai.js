if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "NHentai",
        mirrorIcon: "n-hentai.png",
        languages: "en",
        domains: ["nhentai.net"],
        home: "https://nhentai.net",
        chapter_url: /^\/g\/\d+\/\d+/g,

        getMangaList: async function (search, url = null) {
            return []
            // let doc = await amr.loadPage(this.home + "/search/?q=" + search, { nocache: true, preventimages: true })
            // let res = []
            // let self = this

            // $("div.index-container a.cover", doc).each(function () {
            //     res.push([
            //         $("div.caption", this).text().trim(),
            //         self.home + $(this).attr("href")
            //     ])
            // })

            // let nextPage = $("li.page-item:last", doc)
            // if (!nextPage.hasClass("disabled")) {
            //     res.push(...(await self.getMangaList("", self.home + nextPage.find("a").attr("href"))))
            // }
            return res
        },

        getListChaps: async function (urlManga) {
            // let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            // let res = []
            // let self = this
            // $(".main a.chapt", doc).each(function (index) {
            //     res.push([$(this).text(), self.home + $(this).attr("href")])
            // })
            // return res

            return [["Chapter 1", urlManga + "/1/"]]
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let seriesUrl = curUrl.split("/").slice(0, 5).join("/")
            let doc2 = await amr.loadPage(seriesUrl, { nocache: true, preventimages: true })

            var mgtitle = $($("h1.title .pretty", doc2)[0])
            console.debug(mgtitle)

            let firstChapter = curUrl.split("/")
            firstChapter[5] = 1

            return {
                name: mgtitle.text(),
                currentMangaURL: seriesUrl,
                currentChapterURL: firstChapter.join("/")
            }
        },

        getListImages: async function (doc, curUrl) {
            let lastPage = parseInt($($(".reader-bar a.last", doc)[0]).attr("href").split("/")[3])

            let baseUrl = curUrl.split("/").slice(0, 5).join("/")
            let res = []

            for (const page of Array(lastPage).keys()) {
                let url = baseUrl + "/" + (page + 1) + "/"
                console.debug(url)
                doc = await await amr.loadPage(url)
                res.push($("#image-container img", doc).attr("src"))
                await new Promise(r => setTimeout(r, 250))
            }
            console.debug(res)
            return res

            /*
            This new thing seems temp since its a full url so I am leaving the old code commented out for easier access later
            let images = amr.getVariable("images", doc)
            let server = amr.getVariable("server", doc)
            regex = /const batojs = (.*?);/g
            matches = regex.exec(doc.innerText)
            let key = eval(matches[1])

            let cdnPath = JSON.parse(amr.crypto.AES.decrypt(server, key).toString(amr.crypto.enc.Utf8))
            return images.map(image => cdnPath + image)
            */
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("#image-container img", doc).length > 0
        }
    })
}
