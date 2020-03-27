if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Manga Panda",
        canListFullMangas: false,
        mirrorIcon: "mangapanda.png",
        languages: "en",
        domains: ["www.mangapanda.com"],
        home: "http://www.mangapanda.com/",
        chapter_url: /^\/.*\/[0-9]+.*$/g,

        getMangaList: async function (search) {
            var urlManga = "http://www.mangapanda.com/search/?w=" + search;
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $(".mangaresultinner .manga_name a", doc).each(function () {
                res[res.length] = [$(this).text(), "http://www.mangapanda.com" + $(this).attr("href")];
            });
            return res
        },
    
        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            mangaName = $($("#mangaproperties h1", doc)[0]).text().trim();
            if (mangaName.substr(mangaName.length - 5, 5) === "Manga") {
                mangaName = mangaName.substring(0, mangaName.length - 5).trim();
            }
            $("#chapterlist #listing tr td:first-child", doc).each(function () {
                var txt = "",
                    inlink = $(this).children("a").attr("href");
                $(this).contents().each(function () {
                    txt += $(this).text();
                });
                txt = txt.replace(mangaName.trim(), " ");
                txt = txt.replace(/(\n| )+/g, " ");
                res[res.length] = [txt.trim(), "http://www.mangapanda.com" + inlink];
            });
            res = res.reverse();
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            var name = $($("#mangainfo h2.c4 a", doc)[0]).text().replace("Manga", "").trim();
            var mangaurl = "http://www.mangapanda.com" + $($("#mangainfo h2.c4 a", doc)[0]).attr("href");
            var curChapUrl = "http://www.mangapanda.com" + $($("#mangainfo_son a", doc)[0]).attr("href");
            return {
                "name": name.trim(),
                "currentMangaURL": mangaurl.trim(),
                "currentChapterURL": curChapUrl.trim()
            }
        },
    
        getListImages: async function (doc, curUrl) {
            var res = [];
            $("#pageMenu option", doc).each(function (index) {
                res[res.length] = "http://www.mangapanda.com" + $(this).val();
            });
            return res;
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            let doc = await amr.loadPage(urlImg)
            var src = $("#imgholder img", doc).attr("src");
            $(image).attr("src", src);
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("img", $("#imgholder", doc)).length !== 0;
        }
    })
}