if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga Fast",
        canListFullMangas: false,
        mirrorIcon: "mangafast.webp",
        languages: "en",
        domains: ["mangafast.net"],
        home: "https://mangafast.net",
        chapter_url: /\/.*?chapter-[0-9]+.*\//g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "/?s=" + search, { nocache: true, preventimages: true })
            let res = []
            $(".ls4j h4 a", doc).each(function (index) {
                res.push([
                    $(this).text().trim(),
                    $(this).attr("href")
                ])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $("a.chapter-link", doc).each(function () {
                res.push([
                    $(".text-left", $(this)).text().trim(),
                    $(this).attr('href')
                ])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            return {
                "name": $('.content-title:first', doc).text().trim(),
                "currentMangaURL": $("#chapter li:last a", doc).attr('href'),
                "currentChapterURL": curUrl
            };
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            $(".content-comic img", doc).each(function () {
                res.push($(this).attr('src'))
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(".content-comic img", doc).length > 0
        }
    })
}
