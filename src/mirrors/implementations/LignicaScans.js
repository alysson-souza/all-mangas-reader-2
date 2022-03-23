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
            let resultPage = await amr.loadPage(`${this.home}/search/?q=${search}`, { nocache: true, preventimages: true });
            $("div.manga_card__title", resultPage).each(function() {
                res.push([
                    $("p.line-break", this).text(),
                    $("a", this).attr("href")
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
            let serieLink = $('a#mangalink', doc);
            return {
                "name": serieLink.text().trim(),
                "currentMangaURL": serieLink.attr('href').slice(0, -1),
                "currentChapterURL": curUrl
            };
        },

        getListImages: async function(doc, curUrl) {
            let res = []
            $('div.forgen_reader_image img', doc).each(function() {
                res.push($(this).data('src'));
            })
            return res;
        },

        getImageFromPageAndWrite: async function(urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage: function(doc, curUrl) {
            return $('div.forgen_reader_image', doc).length > 0;
        }
    })
}