if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Zero Scans",
        mirrorIcon: "zeroscans.png",
        languages: "en",
        domains: ["zeroscans.com"],
        home: "https://zeroscans.com/",
        apiUrl: "https://zeroscans.com/swordflake/",
        canListFullMangas: true,
        chapter_url: /^\/comics\/.+\/\d/g,

        getMangaList: async function (search) {
            let doc = await amr.loadJson(this.apiUrl + "comics", {
                nocache: true,
                preventimages: true
            })

            let res = doc.data.comics.map(comic => {
                return [comic.name, this.home + "comics/" + comic.slug]
            })

            return res
        },

        /*
        https://zeroscans.com/swordflake/comic/7/chapters?sort=desc&page=2
        https://zeroscans.com/swordflake/comic/second-life-ranker
        https://zeroscans.com/swordflake/comics

        https://api.zeroscans.com/api/client/comic/7/chapters?sort=desc&page=2


        https:\/\/api.zeroscans.com\/api\/client\/comic\/7\/chapters?page=1
        */

        getListChaps: async function (urlManga) {
            let slug = urlManga.split("/")[4]
            let info = await amr.loadJson(this.apiUrl + "comic/" + slug)

            let res = []

            for (let page = 1, run = true; run; page++) {
                let chapters = await this.getChaptersFromPage(info.data.id, page, slug)
                chapters.length > 0 ? res.push(...chapters) : (run = false)
            }
            return res
        },

        getChaptersFromPage: async function (id, page, slug) {
            let chapters = await amr.loadJson(this.apiUrl + "comic/" + id + "/chapters?sort=desc&page=" + page)
            return chapters.data.data.map(chapter => {
                return [chapter.name, this.home + "comics/" + slug + "/" + chapter.id]
            })
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let slug = curUrl.split("/")[4]
            let info = await amr.loadJson(this.apiUrl + "comic/" + slug)
            return {
                name: info.data.name,
                currentMangaURL: curUrl.split("/").slice(0, 5).join("/"),
                currentChapterURL: curUrl.split("?")[0]
            }
        },

        getListImages: async function (doc, curUrl) {
            let parts = curUrl.split("/")
            let slug = parts[4]
            let chapterId = parts[5]

            let info = await amr.loadJson(this.apiUrl + "comic/" + slug + "/chapters/" + chapterId)

            return info.data.chapter.high_quality
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return true
        }
    })
}
