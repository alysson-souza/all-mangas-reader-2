if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Love Heaven",
        canListFullMangas: true,
        mirrorIcon: "loveheaven.png",
        languages: "en",
        domains: ["loveheaven.net"],
        home: "https://loveheaven.net/",
        chapter_url: /\/read-.*chapter-/g,
        
        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "manga-list.html?listType=allABC", { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(`span[data-toggle="mangapop"] a[href*="manga-"]`, doc).each(function(ind) {
                res.push([
                    $(this).text(),
                    self.home + $(this).attr("href")
                ])
            })
            return res
            
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(`div#tab-chapper a.chapter`, doc).each(function (index) {
                res.push([
                    $(this).text(),
                    self.home + $(this).attr("href")
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let link = $("a.navbar-brand.manga-name", doc)
			return {
				"name": link.text(),
				"currentMangaURL": this.home + link.attr('href'),
				"currentChapterURL": curUrl
			}
        },
    
        getListImages: async function (doc, curUrl) {
            let res = []
            $(`.chapter-content .chapter-img`, doc).each(function() {
                res.push($(this).attr('data-src'))
            })
			return res
        },
    
        getImageFromPageAndWrite: function (urlImg, image) {
            try {
                $(image).attr("src", atob(urlImg))
            } catch (err) {
                $(image).attr("src", urlImg)
            }
        },
    
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(`.chapter-content .chapter-img`, doc).length > 0
        }
    })
}