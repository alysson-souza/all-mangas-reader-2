if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Sad Scans",
        mirrorIcon : "sadscans.png",
        canListFullMangas: false,
        languages : "tr",
        domains: ["sadscans.com"],
        home: "https://sadscans.com/",
        chapter_url: /^\/reader\/.+$/g,

        getMangaList : async function (search) {
            let res = []
            let self = this
            let doc = await amr.loadPage(this.home + "series?search=" + search, { nocache: true, preventimages: true })
            $(".hover-image", doc).each(function () {
                res.push([
                    $('h2', this).text(),
                    self.home + $('a', this).attr('href')
                ])
            })
            return res
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this

            $(".chap-section a", doc).each(function (index) {
                res.push([
                    $(this).attr('title').replace('Bölüm', '').trim(),
                    self.home + $(this).attr('href')
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var mgtitle = $($(".series-title", doc)[0])
            return {
                "name" : mgtitle.text(),
                "currentMangaURL" : this.home + mgtitle.attr('href'),
                "currentChapterURL" : curUrl
            }
        },
    
        getListImages : async function (doc, curUrl) {
            let res = []
            $(".swiper-wrapper img", doc).each(function (index) {
                res.push($(this).attr('data-src'))
            })
            return res
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $(".swiper-wrapper img", doc).length > 0
        }
    })
}