if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manhwa Freak",
        mirrorIcon: "manhwa-freak.png",
        languages: "en",
        domains: ["manhwa-freak.com", "manhwafreak.com"],
        home: "https://manhwa-freak.com",
        canListFullMangas: true,
        chapter_url: /\/.*?ch-[0-9]+.*\//g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "/manga/", { nocache: true, preventimages: true })
            let res = []
            let self = this

            $("div.listupd div.lastest-title a", doc).each(function (index) {
                res.push([$(this).text().trim(), $(this).attr("href")])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, {
                nocache: true,
                preventimages: true
            })
            let res = []
            let self = this

            $("div.chapter-li a", doc).each(function (index) {
                res.push([$("div.chapter-info p:first", this).text().trim(), $(this).attr("href")])
            })

            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let bc = $("div.breadcrumb a", doc)
            return {
                name: $(bc[1]).text().trim(),
                currentMangaURL: $(bc[1]).attr("href"),
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            let regex = /ts_reader\.run\((.*?)\);/g
            let parts = doc.innerText.match(regex)
            let json = JSON.parse(parts[0].replace("ts_reader.run(", "").replace(");", ""))

            json.sources.forEach(source => {
                source.images.forEach(image => {
                    res.push(image)
                })
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("div#readerarea", doc).length > 0
        }
    })
}
