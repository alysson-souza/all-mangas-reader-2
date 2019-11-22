if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "GoodManga",
        canListFullMangas : false,
        mirrorIcon : "goodmanga.png",
        languages : "en",
        domains: ["www.goodmanga.net"],
        home: "http://www.goodmanga.net/",
        chapter_url: /^\/.*\/chapter\/.*$/g,

        getMangaList : async function (search) {
            let doc = await amr.loadPage(
                "http://www.goodmanga.net/manga-search?key=" + search + "&search=Go", 
                { nocache: true, preventimages: true }
            )
            let res = [];
            $(".series_list .right_col h3 a:first-child", doc).each(function (index) {
                res[res.length] = [$(this).text().trim(), $(this).attr("href")];
            });
            return res;
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            $("#chapters ul li a", doc).each(function (index) {
                res[res.length] = [$(this).text().trim(), $(this).attr("href")];
            });
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var name = $("#content #manga_head h3 a", doc).text();
            var nameurl = $("#content #manga_head h3 a", doc).attr("href");
            var chapurl = $("#page #content #assets #asset_1 select.chapter_select:first option:selected", doc).val();
            return {
                "name" : name.trim(),
                "currentMangaURL" : nameurl,
                "currentChapterURL" : chapurl
            };
        },
    
        getListImages : async function (doc, curUrl) {
            var res = [];
            $("#page #content #assets #asset_2 select.page_select:first option", doc).each(function (index) {
                res[res.length] = $(this).val();
            });
            return res;
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            let doc = await amr.loadPage(urlImg)
            var src = $("#manga_viewer img", doc).attr("src");
            $(image).attr("src", src);
        },

        isCurrentPageAChapterPage : function (doc, curUrl) {
            return ($("div#content div#manga_viewer img", doc).length > 0);
        }
    })
}