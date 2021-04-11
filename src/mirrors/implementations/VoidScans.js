if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Void Scans",
        mirrorIcon: "voidscans.png",
        languages: "en",
        domains: ["voidscans.net"],
        home: "https://voidscans.net/",
        chapter_url: /^\/read\/\d+\/\d+/g,
        canListFullMangas: true,
        

        getMangaList : async function (search) {
            let doc = await amr.loadPage(this.home + "library", { nocache: true, preventimages: true })
            let res = []
            $("main .col", doc).each(function () {
                res.push([
                    $('h2', this).text().trim(),
                    $('a:first', this).attr('href')
                ])
            })
            return res
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $("ul a.list-group-item", doc).each(function (index) {
                res.push([
                    $(this).text().trim(),
                    $(this).attr('href')
                ])
            })
            res.reverse()
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            let seriesUrl = this.home + 'library/' + curUrl.split('/')[4]
            let doc2 = await amr.loadPage(seriesUrl, { nocache: true, preventimages: true })
            return {
                "name" : $('h1', doc2).text().trim(),
                "currentMangaURL" : seriesUrl,
                "currentChapterURL" : curUrl.split("/").slice(0, 6).join("/")
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let res = []
            $("#flipbook .img-fluid", doc).each(function (index) {
                res.push($(this).attr('data-image'))
            })
            return res
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $("#flipbook .img-fluid", doc).length > 0;
        }
    })
}