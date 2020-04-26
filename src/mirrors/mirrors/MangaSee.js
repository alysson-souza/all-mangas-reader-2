if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "MangaSee",
        canListFullMangas : true,
        mirrorIcon : "mangasee.png",
        languages : "en",
        domains: ["mangaseeonline.us"],
        home: "https://mangaseeonline.us",
        chapter_url: /^\/read-online\/.*$/g,

        getMangaList : async function (search) {
            let doc = await amr.loadPage("https://mangaseeonline.us/directory/", { nocache: true, preventimages: true })
            let res = [];
            $("p.seriesList a", doc).each(function () {
                res.push([$(this).text(), "https://mangaseeonline.us" + $(this).attr('href')]);
            });
            return res;
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            $(".chapter-list a.list-group-item", doc).each(function (index) {
                res[res.length] = [$('span:first', this).text(), "https://mangaseeonline.us" + $(this).attr('href')];
            });
            return res;
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var mgtitle = $($("a.list-link[href*='/manga/']", doc)[0])
            return {
                "name" : mgtitle.text().trim().split("\n")[0].trim(),
                "currentMangaURL" : "https://mangaseeonline.us" + mgtitle.attr("href"),
                "currentChapterURL" : curUrl
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let fullUrl = curUrl.replace('-page-1.html', '.html')
            doc = await amr.loadPage(fullUrl, { nocache: true})

            let res = []
            $('div.image-container-manga img', doc).each(function() {
                res.push($(this).attr('src'))
            })
            return res
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $("div.image-container-manga", doc).length > 0;
        }
    })
}