if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "CatManga",
        mirrorIcon: "catmanga.png",
        languages: "en",
        domains: ["catmanga.org"],
        home: "https://catmanga.org/",
        chapter_url: /^\/series\/.*?\/\d+$/g,
        jsonDataRegex: /&lt;script\s+id="__NEXT_DATA__"\s+type="application\/json"&gt;(.*?)&lt;\/script&gt;/m,

        getMangaList: async function () {
            const doc = await amr.loadPage("https://catmanga.org", {nocache: true, preventimages: true});
            const json = JSON.parse(doc.outerHTML.match(this.jsonDataRegex)[1]);
            const res = [];
            json.props.pageProps.series.forEach(s => {
                res.push([s.title, `https://catmanga.org/series/${s.series_id}`]);
            })

            return res;
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, {nocache: true, preventimages: true});
            const json = JSON.parse(doc.outerHTML.match(this.jsonDataRegex)[1]);
            const res = [];
            json.props.pageProps.series.chapters.forEach(c => {
                res.push([c.title, `${urlManga}/${c.number}`]);
            });

            return res.reverse();
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let chapterName = $("span[class^='readerNavigation_seriesTitle']", doc).text().trim();
            let mangaUrl = `https://catmanga.org${$("div[class^='readerNavigation_title']", doc).attr("href")}`;

            return {
                name: chapterName,
                currentMangaURL: mangaUrl,
                currentChapterURL: curUrl,
            };
        },

        getListImages: async function (doc) {
            const json = JSON.parse(doc.outerHTML.match(this.jsonDataRegex)[1]);
            const res = [];
            json.props.pageProps.pages.forEach(pageUrl => {
                res.push(pageUrl);
            });
            return res;
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage: function (doc) {
            return $("img[alt^='Page']", doc).length > 0;
        },
    });
}
