if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "MangaKawaii",
        mirrorIcon: "mangakawaii.png",
        languages: "fr",
        domains: ["www.mangakawaii.com"],
        home: "https://www.mangakawaii.com",
        chapter_url: /\/manga\/.*\/.*\/?.*$/g,

        getMangaList: async function(search) {
            let res = [];
            let self = this;
            let resultPage = await amr.loadPage(`${this.home}/search?query=${search}&search_type=manga`, { nocache: true, preventimages: true });
            $("li.mb-2 a", resultPage).each(function() {
                res.push([
                    $(this).text(),
                    self.home + $(this).attr('href')
                ])
            });
            return res;
        },

        getListChaps: async function(urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true });
            let res = [];
            let self = this;

            let params = doc.innerText.match(/params=(.*)\", true/)[1];
            let chapters = await amr.loadPage(`${this.home}/arrilot/load-widget?id=2&name=ChapterInfo&params=${params}`);
            $(".table__chapter a", chapters).each((idx, link) => {
                // +1 is here to handle the history.pushstate
                res.push([
                    $(link).text(),
                    this.home + $(link).attr("href") + "/1"
                ]);
            });
            return res;
        },

        getInformationsFromCurrentPage: async function(doc, curUrl) {
            // we don't use this link because the title can be truncated
            let serieLink = $("h1 a.mr-3", doc).attr('href');
            let mangaPage = await amr.loadPage(this.home + serieLink, { preventimages: true });
            let mangaTitle = $("h1", mangaPage).text();
            return {
                "name": mangaTitle,
                "currentMangaURL": this.home + serieLink,
                "currentChapterURL": curUrl.endsWith('/1') ? curUrl : curUrl + "/1"
            };
        },

        getListImages: async function(doc, curUrl) {
            let res = []
            $('img.img-fluid.lazyload', doc).each(function() {
                res.push($(this).attr('data-src'))
            })
            return res
        },

        getImageFromPageAndWrite: async function(urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage: function(doc, curUrl) {
            return $('img.img-fluid', doc).length > 0;
        }
    })
}