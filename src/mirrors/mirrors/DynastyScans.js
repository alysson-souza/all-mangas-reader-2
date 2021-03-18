if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Dynasty Scans",
        canListFullMangas : true,
        mirrorIcon : "dynastyscans.png",
        languages : "en",
        domains: ["dynasty-scans.com"],
        home: "https://dynasty-scans.com/",
        chapter_url: /^\/chapters\/.+$/g,

        getMangaList : async function (search) {
            let doc = await amr.loadPage("https://dynasty-scans.com/series", { nocache: true, preventimages: true })
            let res = [];
            $(".tag-list a", doc).each(function () {
                res.push([$(this).text(), "https://dynasty-scans.com" + $(this).attr('href')]);
            });
            return res;
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            $(".chapter-list a.name", doc).each(function (index) {
                res[res.length] = [$(this).text(), "https://dynasty-scans.com" + $(this).attr('href')];
            });
            res.reverse();
            return res;
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var mgtitle = $($("#chapter-title a", doc)[0])
            return {
                "name" : mgtitle.text(),
                "currentMangaURL" : "https://dynasty-scans.com" + mgtitle.attr("href"),
                "currentChapterURL" : curUrl.split("/").slice(0, 5).join("/")
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let pages = amr.getVariable("pages", doc)
            return pages.map(page => "https://dynasty-scans.com" + page.image);
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $("#image img", doc).length > 0;
        }
    })
}