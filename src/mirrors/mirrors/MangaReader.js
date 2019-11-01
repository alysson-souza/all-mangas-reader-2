if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga Reader",
        canListFullMangas: false,
        mirrorIcon: "mangareader.png",
        domains: ["www.mangareader.net"],
        home: "https://www.mangareader.net/",
        chapter_url: /\/.*\/[0-9]+.*/g,
        languages: "en",
    
        getMangaList: async function (search) {
            let urlManga = "https://www.mangareader.net/search/?w=" + search + "&rd=0&status=0&order=0&genre=0000000000000000000000000000000000000&p=0";
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            var res = [];
            $(".manga_name a", doc).each(function (index) {
                res[res.length] = [
                    $(this).text(),
                    "https://www.mangareader.net" + $(this).attr("href")
                ];
            });
            return res;
        },
    
        getListChaps: async function (urlManga) {
            if (urlManga.indexOf("http://") == 0) urlManga = "https://" + urlManga.substring(7);
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            
            var res = [];
            var mangaName = $("#mangaproperties h1", doc).text().replace("Manga", "").trim();
            $("#chapterlist #listing tr td:first-child a", doc).each(function (index) {
                res[res.length] = [
                    $(this).text().replace(mangaName, "").trim(), 
                    "https://www.mangareader.net" + $(this).attr("href")
                ];
            });
            res = res.reverse();
            return res;
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            var name = $($("#mangainfo h2.c4 a", doc)[0]).text().replace("Manga", "").trim();
            var mangaurl = "https://www.mangareader.net" + $($("#mangainfo h2.c4 a", doc)[0]).attr("href");
            var curChapUrl = "https://www.mangareader.net" + $($("#mangainfo_son a", doc)[0]).attr("href");
            return {
                "name": name,
                "currentMangaURL": mangaurl,
                "currentChapterURL": curChapUrl
            };
        },
    
        getListImages: async function (doc, curUrl) {
            res = [];
            $("#pageMenu option", doc).each(function (index) {
                res[res.length] = "https://www.mangareader.net" + $(this).val();
            });
            return res;
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            let doc = await amr.loadPage(urlImg)
            let src = $("#imgholder img", doc).attr("src")
            $(image).attr("src", src)
        },
    
        whereDoIWriteScans: function (doc, curUrl) {
            return $("#inject-chap", doc);
        },
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return ($("img", $("#imgholder", doc)).length !== 0);
        },
        doSomethingBeforeWritingScans: function (doc, curUrl) {
            var imgholder = $("#imgholder", doc).closest("table");
            var ws = $("<div id='inject-chap'></div>");
            imgholder.before(ws);
            imgholder.empty();
            ws.css("width", "auto");
            $("#selection", doc).next().remove();
            $("#selection", doc).remove();
            $("#navi", doc).empty();
            $("#selectmanga", doc).empty();
            $("#wrapper_body", doc).css("width", "auto");
            $("#topchapter", doc).css("width", "950px");
            $("#topchapter", doc).css("text-align", "center");
        },
        doAfterMangaLoaded: function (doc, curUrl) {
            $("body > div:empty", doc).remove();
        }
    })
}