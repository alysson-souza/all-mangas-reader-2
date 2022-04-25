if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Union Leitor",
        canListFullMangas: false,
        mirrorIcon: "unionleitor.png",
        domains: ["unionleitor.top", "unionmangas.top"],
        languages: "br,pt",
        home: "https://unionleitor.top/",
        chapter_url: /\/leitor\/.*\/.*/g,

        getMangaList: async function (search) {
            var urlManga = this.home + "busca"
            let doc = await amr.loadPage(urlManga, {
                nocache: true,
                preventimages: true,
                post: true,
                data: {
                    pesquisa: search
                }
            })
            var res = []
            $(".bloco-manga", doc).each(function (index, bloc) {
                let link = $(bloc).find("a:last")
                if (link) {
                    res.push([link.text().trim(), link.attr("href")])
                }
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $('.col-md-8 .capitulos a[href*="/leitor/"]', doc).each(function () {
                res.push([$(this).text().trim(), $(this).attr("href")])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mga = $(".breadcrumbs div div a:last", doc)
            return {
                name: mga.text().trim(),
                currentMangaURL: mga.attr("href"),
                currentChapterURL: curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []

            $("img.img-manga", doc).each(function (index, element) {
                res.push($(this).attr("src"))
            })
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("img.img-manga", doc).length > 0
        }
    })
}
