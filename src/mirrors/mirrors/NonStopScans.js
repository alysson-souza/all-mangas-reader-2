if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Non Stop Scans",
        mirrorIcon: "nonstopscans.png",
        languages: "en",
        domains: ["www.nonstopscans.com"],
        home: "https://www.nonstopscans.com/",
        // chapter_url: /^\/manga\/.*\/.*$/g,


        getMangaList : async function (search) {
            let res = []
            let urlManga = this.home + "?s=" + search;
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })

            $('.listupd a[href*="/manga/"]', doc).each(function (index) {
                res.push([
                    $(this).find('.tt').text().trim(),
                    $(this).attr("href")
                ])
            })
            return res
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $(".lchx a", doc).each(function (index) {
                res.push([$(this).text(), $(this).attr('href')])
            });
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var mgtitle = $(".allc a", doc)
            return {
                "name" : mgtitle.text(),
                "currentMangaURL" : mgtitle.attr("href"),
                "currentChapterURL" : curUrl
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let res = []
            $("div#readerarea img", doc).each(function(index) {
                res.push($(this).attr('src'))
            })
            return res
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $("div#readerarea img", doc).length > 0
        }
    })
}