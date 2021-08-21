if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "EarlyManga",
        mirrorIcon: "earlymanga.png",
        languages: "en",
        domains: ["earlymanga.net", "earlymanga.xyz", "earlymanga.me", "earlymanga.org"],
        home: "https://earlymanga.org",
        chapter_url: /^\/manga\/.*\/.+$/g,

        getMangaList : async function (search) {
            let doc = await amr.loadPage(this.home + "/search?search=" + search, { nocache: true, preventimages: true })
            let res = []
            let self = this

            $("a.manga_title", doc).each(function (index) {
                res.push([
                    $(this).text(),
                    self.home + $(this).attr("href")
                ])
            })
            return res
        },
    
        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { 
                nocache: true, 
                preventimages: true,
            })
            let res = []
            let self = this

            $("#chapters .col-lg-5 a[style!='display:none']:contains('Chapter'):not('.d-none')", doc).each(function (index) {
                if ($(this).text().includes('You need to open'))
                    return
                
                res.push([
                    $("div[style!='display:none']",this).text().trim(), 
                    self.home + $(this).attr("href")
                ])
            })

            if ($('ul.pagination', doc).length && $('ul.pagination .page-item:last a[href!=""]', doc).length) {
                let nextPage = $($('ul.pagination .page-item:last a[href!=""]', doc)[0]).attr('href')
                res.push(...await self.getListChaps(nextPage))
            }
            
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mg = $($('ul.navigation a:first', doc)[0])
            return {
                "name": mg.text().trim(),
                "currentMangaURL": this.home + mg.attr("href"),
                "currentChapterURL": curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            let self = this
            $(".chapter-images-container-up img", doc).each(function (index) {
                res.push(self.home + $(this).attr("src"))
            });
            return res;
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(".chapter-images-container-up img", doc).length > 0
        }
    })
}