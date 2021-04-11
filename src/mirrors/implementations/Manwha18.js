if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Manwha 18",
        canListFullMangas: true,
        mirrorIcon: "manwha18.png",
        languages: "en",
        domains: ["manhwa18.com"],
        home: "https://manhwa18.com/",
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
            $(`div.chapter-content img`, doc).each(function() {
                res.push($(this).attr('src'))
            })
			return res
        },
    
        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
    
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(`div.chapter-content img`, doc).length > 0
        }
    });
}