if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Lugnica Scan",
        mirrorIcon: "lugnicascan.png",
        languages: "fr",
        domains: ["lugnica-scans.com"],
        home: "https://lugnica-scans.com/",
        chapter_url: /\/manga\/.*\/.*\/?$/,

        getMangaList: async function (search) {
            let res = []
            let catalog = await amr.loadJson(`${this.home}api/get/catalog?page=0&filter=all`)
            searchRegExp = new RegExp(`${search}`, "i")
            let self = this
            catalog
                .filter(entry => {
                    return searchRegExp.test(entry.title)
                })
                .forEach(function (e) {
                    res.push([e.title, `${self.home}manga/${e.slug}`])
                })
            return res
        },

        getListChaps: async function (urlManga) {
            let slug = urlManga.split("/")[4]
            let mangaObject = await amr.loadJson(`${this.home}api/get/card/${slug}`)
            let chapters = mangaObject.chapters
            let res = []
            for (volume in chapters) {
                res = res.concat(chapters[volume])
            }
            // sort by id chapter, this better than chapter
            res.sort((elem1, elem2) => elem2.id - elem1.id)
            let self = this
            return res.map(elem => [
                `Chapitre ${elem.chapter}`,
                `${self.home}manga/${mangaObject.manga.slug}/${elem.chapter}`
            ])
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let slug = curUrl.split("/")[4]
            let mangaInfo = await amr.loadJson(`${this.home}api/get/card/${slug}`)
            return {
                name: mangaInfo.manga.title,
                currentMangaURL: `${this.home}manga/${mangaInfo.manga.slug}`,
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let slug = curUrl.split("/")[4]
            let chapter = curUrl.split("/")[5]
            let mangaInfo = await amr.loadJson(`${this.home}api/get/chapter/${slug}/${chapter}`)
            return mangaInfo.chapter.files.map(
                file => `${this.home}/upload/chapitre/${mangaInfo.manga.id}/${chapter}/${file}`
            )
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            console.log("this.chapter_url.test(curUrl)=", this.chapter_url.test(curUrl))
            return this.chapter_url.test(curUrl)
        }
    })
}
