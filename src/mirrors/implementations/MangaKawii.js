if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "MangaKawaii",
        mirrorIcon: "mangakawaii.png",
        languages: "fr",
        domains: ["www.mangakawaii.net"],
        home: "https://www.mangakawaii.net",
        chapter_url: /\/manga\/.*\/.*\/?.*$/g,

        getMangaList: async function(search) {
            let res = [];
            let self = this;
            let resultPage = await amr.loadPage(`${this.home}/search?query=${search}&search_type=manga`, { nocache: true, preventimages: true });
            $("li h4 a", resultPage).each(function() {
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

            // let params = doc.innerText.match(/params=(.*)\", true/)[1];
            // let chapters = await amr.loadPage(`${this.home}/arrilot/load-widget?id=2&name=ChapterInfo&params=${params}`);
            $(".table__chapter a", doc).each((idx, link) => {
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
            let serieLink = $("h1 a", doc).attr('href');
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
            //image = "https://cdn.mangakawaii.net/uploads/manga/" + oeuvre_slug + "/chapters_" + applocale + "/" + chapter_slug + "/" + pages[e - 1].page_image + "?" + pages[e - 1].page_version
            let pages = amr.getVariable("pages", doc),
                oeuvre_slug = amr.getVariable("oeuvre_slug", doc),
                chapter_slug = amr.getVariable("chapter_slug", doc),
                applocale = amr.getVariable("applocale", doc)

            for (page of pages) {
                res.push(`https://cdn.mangakawaii.net/uploads/manga/${oeuvre_slug}/chapters_${applocale}/${chapter_slug}/${page.page_image}?${page.page_version}`)
            }
            return res
        },

        getImageFromPageAndWrite: async function(urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage: function(doc, curUrl) {
            return $('select#page-list', doc).length > 0;
        }
    })
}