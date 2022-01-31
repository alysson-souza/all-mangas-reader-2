if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Manwha 18",
        canListFullMangas: false,
        mirrorIcon: "manwha18.png",
        languages: "en",
        domains: ["manhwa18.com"],
        home: "https://manhwa18.com/",
        chapter_url: /\/chapter-.*|\/chap-.*/g,
        
        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "tim-kiem?q=" + search, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(`.series-title a`, doc).each(function(ind) {
                res.push([
                    $(this).text(),
                    $(this).attr("href")
                ])
            })
            return res
            
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(`ul.list-chapters a`, doc).each(function (index) {
                res.push([
                    $('.chapter-name', this).text().trim(),
                    $(this).attr("href")
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let link = $($("ul.breadcrumb li a", doc)[2])
            let titlePage = await amr.loadPage(link.attr('href'))

			return {
				"name": $('.series-name', titlePage).text(),
				"currentMangaURL": link.attr('href'),
				"currentChapterURL": curUrl
			}
        },
    
        getListImages: async function (doc, curUrl) {
            let res = []
            $(`div#chapter-content img`, doc).each(function() {
                res.push($(this).attr('data-src'))
            })
			return res
        },
    
        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
    
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(`div#chapter-content img`, doc).length > 0
        }
    });
}