if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Banana Scan",
        mirrorIcon: "banana-scan.png",
        languages: "fr",
        domains: ["banana-scan.com"],
        home: "https://banana-scan.com/",

        chapter_url: /\/.*?-[0-9]+.*\//g,
        getMangaList: async function (search) {
            let res = []
            let jsonResult = await amr.loadJson(`${this.home}/wp-admin/admin-ajax.php`, {
                nocache: true,
                preventimages: true,
                post: true,
                processData: false,
                headers: { "X-Requested-With": "XMLHttpRequest", "Content-type": "application/x-www-form-urlencoded" },
                data: {
                    action: "ts_ac_do_search",
                    ts_ac_query: search
                }
            })
            res = jsonResult.series[0].all.map(e => [e.post_title, e.post_link])
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            let title = $("h2", doc).text().trim()
            $("div#chapterlist li a", doc).each(function (index) {
                let chapUrl = $(this).attr("href")
                let chapTitle = $("span.chapternum", this).text()
                res.push([chapTitle, chapUrl])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let serieLink = $("div.allc a", doc)
            return {
                name: serieLink.text().trim(),
                currentMangaURL: serieLink.attr("href"),
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
            return $("div.chapterbody", doc).length > 0
        }
    })
}
