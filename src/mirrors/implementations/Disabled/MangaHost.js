if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "MangaHost",
        canListFullMangas: false,
        mirrorIcon: "mangahost.png",
        languages: "br,pt",
        domains: ["mangahosted.com", "mangahost-br.cc", "mangahost1.com", "mangahost2.com"],
        home: "https://mangahost2.com/",
        chapter_url: /\/manga\/.*\/.+/g,
        disabled: true,
        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "find/" + search, {
                nocache: true,
                preventimages: true
            })
            let res = []
            $(".table-search h3.entry-title a", doc).each(function (index) {
                res.push([$(this).text(), $(this).attr("href")]);
            });
            return res
        },

        getListChaps: async function (urlManga) {
            console.log(urlManga)
            let doc = await amr.loadPage(urlManga, {
                nocache: true,
                preventimages: true
            })
            let res = [];
            if ($("ul.list_chapters li a", doc).length > 0) {
                $("ul.list_chapters li a", doc).each(function (index) {
                    res.push([$(this).attr("title"), urlManga + "/" + $(this).attr("id")]);
                });
            } else {
                $("a.capitulo", doc).each(function (index) {
                    res.push([$(this).text(), $(this).attr("href")]);
                });
            }
            // https://mangahost2.com/manga/one-punch-man-mh96344/166
            // https://mangahost2.com/manga/one-punch-man/166
            console.log(res)
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mg = $(".breadcrumb a[href*='/manga/']:first", doc)
            let url = mg.attr("href")
            //let urlnomh = url.substr(0, url.indexOf("-mh"))
            return {
                "name": mg.text(),
                "currentMangaURL": url,
                //"currentChapterURL": (curUrl.indexOf(url) >= 0 ? url : urlnomh) + "/" + $("select.chapters option:selected", doc).val()
                "currentChapterURL": url + "/" + $("select.chapters option:selected", doc).val()
            }
        },

        getListImages: async function (doc, curUrl) {
            var res = [];
            var images = amr.getVariable("images", doc)
            return images.map(astr => {
                return $("img", $(astr)).attr("src")
            })
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("#imageWrapper img", doc).length > 0;
        }
    })
}
