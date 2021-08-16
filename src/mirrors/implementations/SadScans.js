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
            let id = curUrl.split('/')[4]
            let self = this
            $(".swiper-wrapper .swiper-slide", doc).each(function (index) {
                let hash = $(this).attr('data-hash')
                // let url = self.home + 'config.json?_cid=' + id + '&' + hash
                res.push(id + '|' + hash)
            })
            return res
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            let parts = urlImg.split('|')
            let url = this.home + 'config.json?_cid=' + parts[0] + '&' + parts[1]
            await fetch(url).then(
                blob =>blob.json().then(
                    dat => $(image).attr("src", 'data:image/;base64,' + dat[0])
            ))
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $(".swiper-wrapper .swiper-slide", doc).length > 0
        }
    })
}