if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Disaster Scans",
        mirrorIcon: "disasterscans.png",
        languages: "en",
        domains: ["disasterscans.com"],
        home: "https://disasterscans.com",
        chapter_url: /^\/.*\/.*\/.*-chapter-.*/g,
        canListFullMangas: false,

        getMangaList: async function (search) {
            let res = []
            let self = this
            let resultPage = await amr.loadPage(`${this.home}/comics`, {
                nocache: true,
                preventimages: true
            })
            $("a[href*='/comics/']", resultPage).each(function () {
                res.push([$(this).text(), self.home + $(this).attr("href")])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this

            let regex = /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/g
            let matches = regex.exec(doc.innerText)
            let data = JSON.parse(matches[1])

            data.props.pageProps.chapters.forEach(elem =>
                res.push([
                    ("Chapter " + elem.chapterNumber + (elem.ChapterName != "" ? " - " + elem.ChapterName : "")).trim(),
                    urlManga + "/" + elem.chapterID + "-chapter-" + elem.chapterNumber
                ])
            )
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            return {
                name: $('h1[class*="chapter_comicName"]', doc).text().trim(),
                currentMangaURL: curUrl.split("/").slice(0, 5).join("/"),
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            $("img[alt='00']", doc).each(function () {
                res.push($(this).attr("src"))
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("img[alt='00']", doc).length > 0
        }
    })
}
