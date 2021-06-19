if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "ZA Hard Top",
        mirrorIcon : "zahardtop.png",
        canListFullMangas: true,
        languages : "en",
        domains: ["zahard.top"],
        home: "https://zahard.top",
        chapter_url: /^\/manga\/.+\/.*$/g,

        getMangaList : async function (search) {
            let res = []
            let doc = await amr.loadPage(this.home + "/changeMangaList?type=text", { nocache: true, preventimages: true })
            $("a.alpha-link", doc).each(function () {
                res.push([
                    $(this).text(),
                    $(this).attr('href')
                ])
            })
            return res
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let title = $('h2.widget-title:first', doc).text().trim()

            console.log('Title: ' + title)

            $("h5 a", doc).each(function (index) {
                console.log('Chapter Title: ' + $(this).text())
                res.push([
                    $(this).text().replace(title, '').trim(),
                    $(this).attr('href')
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var mgtitle = $($("h1.readerMsj-title", doc)[0])
            return {
                "name" : mgtitle.text(),
                "currentMangaURL" : curUrl.split("/").slice(0, 5).join("/"),
                "currentChapterURL" : curUrl
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let res = []
            $("img.img-responsive", doc).each(function (index) {
                let src = $(this).attr('data-src')
                if (src)
                    res.push(src.trim())
            })
            return res
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $("img.img-responsive", doc).length > 0
        }
    })
}