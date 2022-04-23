if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Readm.org",
        canListFullMangas: true,
        mirrorIcon: "readm.png",
        languages: "en",
        domains: ["readm.org"],
        home: "https://readm.org/",
        chapter_url: /^\/manga\/.*\/.*/g,

        getMangaList: async function (search) {
            let json = await amr.loadJson("https://readm.org/service/search", {
                nocache: true,
                preventimages: true,
                post: true,
                // processData: false,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-type": "application/x-www-form-urlencoded"
                },
                data: {
                    dataType: "json",
                    phrase: search
                }
            })

            let res = []

            for (let i in json.manga) {
                // res.push([i, i]);
                let item = json.manga[i]
                res.push([item.title.trim(), "https://readm.org" + item.url.trim()])
            }

            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, {
                nocache: true,
                preventimages: true
            })

            let res = []
            $("#table-episodes-title > h6 > a", doc).each(function () {
                let url = "https://readm.org" + $(this).attr("href")
                let chap = $(this).text().trim()
                res.push([chap, url])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mga = $("#router-view > div > div.ui.grid.mt-0 > div > h1", doc)
            return {
                name: $("a", mga).text().trim(),
                currentMangaURL: "https://readm.org" + $("a", mga).attr("href"),
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []

            $("#router-view > div > div.ui.grid.chapter > div.ch-images.ch-image-container > center > img", doc).each(
                function () {
                    res.push("https://readm.org" + $(this).attr("src"))
                }
            )

            $(
                "#router-view > div > div.ui.grid.chapter > div.ch-images.ch-image-container > center > a > img",
                doc
            ).each(function () {
                res.push("https://readm.org" + $(this).attr("src"))
            })

            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("#router-view > div > div.ui.grid.mt-0 > div > h1", doc).length > 0
        }
    })
}
