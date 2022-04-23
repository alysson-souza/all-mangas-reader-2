if (typeof registerMangaObject === "function") {
    registerMangaObject({
        disabled: true,
        mirrorName: "Glitchy Comics",
        canListFullMangas: true,
        mirrorIcon: "glitchycomics.png",
        languages: "en",
        domains: ["glitchycomics.com"],
        home: "https://glitchycomics.com/",
        chapter_url: /\/chapter-.*?\/.*$/g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://glitchycomics.com/series-list", {
                nocache: true,
                preventimages: true
            })
            let res = []

            $("article h6 > a", doc).each(function () {
                res.push([$(this).text().trim(), $(this).attr("href")])
            })

            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []

            $(".ult_acord h2 a", doc).each(function () {
                res[res.length] = [$(this).text(), $(this).attr("href")]
            })

            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            const title = $("p.s-post-cat-links > a", doc)

            return {
                name: title.text().trim(),
                currentMangaURL: title.attr("href"),
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc) {
            return $("div.s-post-content img[class^='wp-image-']", doc)
                .toArray()
                .map(img => img.src)
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc) {
            return $("div.s-post-content img[class^='wp-image-']", doc).length > 0
        }
    })
}
