if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Tachidesk",
        canListFullMangas: true,
        mirrorIcon: "tachidesk.png",
        languages: "en",
        domains: ["tachidesk"],
        home: "tachidesk",
        chapter_url: /\/manga\/\d+\/chapter\/\d+/g,

        apiUrl: function () {
            return new URL("/api/v1/", new URL(amr.getOption("tachideskUrl")).href)
        },

        getMangaList: async function (search) {
            let categories = await amr.loadJson(this.apiUrl() + "category")

            return Object.assign(
                {},
                ...(await Promise.all(
                    categories.map(async ele => {
                        let data = await amr.loadJson(this.apiUrl() + "category/" + ele.id)
                        return data.map(elem => {
                            return [elem.title, new URL("manga/" + elem.id, amr.getOption("tachideskUrl")).href]
                        })
                    })
                ))
            )
        },

        getListChaps: async function (urlManga) {
            let id = urlManga
                .split("/")
                .filter(ele => ele != "")
                .slice(-1)[0]
            let data
            try {
                data = await amr.loadJson(this.apiUrl() + "manga/" + id + "/chapters?onlineFetch=true")
            } catch (e) {
                console.warn("tachidesk onlineFetch failed for id:" + id + " manga, trying onlineFetch=false")
                data = await amr.loadJson(this.apiUrl() + "manga/" + id + "/chapters?onlineFetch=false")
            }
            return data.map(ele => {
                return [ele.name, new URL("manga/" + id + "/chapter/" + ele.index, amr.getOption("tachideskUrl")).href]
            })
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let id = curUrl
                .split("/")
                .filter(ele => ele != "")
                .slice(-3)[0]
            let chapid = curUrl
                .split("/")
                .filter(ele => ele != "")
                .slice(-1)[0]

            let manga = await amr.loadJson(this.apiUrl() + "manga/" + id)
            return {
                name: manga.title,
                currentMangaURL: new URL("manga/" + id, amr.getOption("tachideskUrl")).href,
                currentChapterURL: new URL("manga/" + id + "/chapter/" + chapid, amr.getOption("tachideskUrl")).href
            }
        },

        getListImages: async function (doc, curUrl) {
            let id = curUrl
                .split("/")
                .filter(ele => ele != "")
                .slice(-3)[0]
            let chapid = curUrl
                .split("/")
                .filter(ele => ele != "")
                .slice(-1)[0]

            let chapdat = await amr.loadJson(this.apiUrl() + "manga/" + id + "/chapter/" + chapid)

            return Array(chapdat.pageCount)
                .fill(0)
                .map((_, pageNumber) => {
                    return (
                        this.apiUrl() + "manga/" + id + "/chapter/" + chapid + "/page/" + pageNumber + "?useCache=true"
                    )
                })
        },

        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return (
                curUrl
                    .split("/")
                    .filter(ele => ele != "")
                    .slice(-2)[0] == "chapter"
            )
        }
    })
}
