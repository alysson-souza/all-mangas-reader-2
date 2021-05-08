if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Lugnica Scan",
        mirrorIcon: "lugnicascan.png",
        languages: "fr",
        domains: ["lugnica-scans.com"],
        home: "https://lugnica-scans.com/",
        chapter_url: /\/lecture\/.*\/.*\/$/g,

        getMangaList: async function(search) {
            let res = [];
            let resultPage = await amr.loadPage(`${this.home}/?q=${search}`, { nocache: true, preventimages: true });
            $("div.fiche", resultPage).each(function() {
                res.push([
                    $("div.titre a span b", this).text(),
                    $("a", this).attr("href").replace("annexe", "manga")
                ]);
            });
            return res;
        },

        getListChaps: async function(urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true });
            let res = [];
            let self = this;
            let title = $('h2', doc).text().trim();
            $('div.manga-content a:not([href$="/comments"])', doc).each(function(index) {
                res.push([$(this).text().trim(), $(this).attr('href')]);
            });
            return res;
        },

        getInformationsFromCurrentPage: async function(doc, curUrl) {
            let serieLink = $('h2 b a', doc);
            return {
                "name": serieLink.text().trim(),
                "currentMangaURL": serieLink.attr('href'),
                "currentChapterURL": curUrl
            };
        },

        getListImages: async function(doc, curUrl) {
            let res = []
            $('img.reader-imgwidth', doc).each(function() {
                res.push($(this).attr('src'))
            })
            return res
        },

        getImageFromPageAndWrite: async function(urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage: function(doc, curUrl) {
            return $('img.reader-imgwidth', doc).length > 0;
        }
    })
}