if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Martial Scans",
        canListFullMangas: true,
        mirrorIcon: "martialscans.png",
        languages: "en",
        domains: ["martialscans.com"],
        home: "https://martialscans.com/",
        chapter_url: /\/chapter-[\d\.]+$/g,

        getMangaList: async function(search) {
            let doc = await amr.loadPage("https://martialscans.com/comics", { nocache: true, preventimages: true });
            let res = [];

            $("div[class^='Comics_singleCards']", doc)
                .children("a")
                .each(function() {
                    res.push([
                        $("h2", this)
                            .text()
                            .trim(),
                        "https://martialscans.com" + $(this).attr("href"),
                    ]);
                });

            return res;
        },

        getListChaps: async function(urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true });
            let res = [];

            $("div[class^='textList_chapters']", doc)
                .children("a")
                .each(function() {
                    res[res.length] = [$("h6", this).text(), "https://martialscans.com" + $(this).attr("href")];
                });
            res.reverse();

            return res;
        },

        getInformationsFromCurrentPage: async function(doc, curUrl) {
            const lastSlash = curUrl.lastIndexOf("/");

            return {
                name: $("h3", doc)
                    .text()
                    .trim(),
                currentMangaURL: curUrl.slice(0, lastSlash),
                currentChapterURL: curUrl,
            };
        },

        getListImages: async function(doc) {
            return $("img[class^='reading_readingIMG']", doc)
                .toArray()
                .map((img) => img.src);
        },

        getImageFromPageAndWrite: async function(urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage: function(doc) {
            return $("img[class^='reading_readingIMG']", doc).length > 0;
        },
    });
}
