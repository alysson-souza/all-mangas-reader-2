if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Manwha18.net",
        canListFullMangas: false,
        mirrorIcon: "manwha18.png",
        languages: "en",
        domains: ["manhwa18.net"],
        home: "https://manhwa18.net/",
        chapter_url: /read-.*-chapter-.*/g,
        
        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "app/manga/controllers/cont.search.php?keyword=" + search, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(`a.item`, doc).each(function(ind) {

              // remove leading slash from $(this).attr('href') if present
              let link = $(this).attr('href')
              if(link.charAt(0) === "/") link = link.substring(1)

                res.push([
                    $('h6', this).text(),
                    self.home + link
                ])
            })
            return res
            
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(`ul.list-chapters a`, doc).each(function (index) {

              // remove leading slash from $(this).attr('href') if present
              let link = $(this).attr('href')
              if(link.charAt(0) === "/") link = link.substring(1)

                res.push([
                    $('.chapter-name', this).text().replace(/chapter|chap|ch/g, '').trim(),
                    self.home + link
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let link = $($("nav .breadcrumb > .breadcrumb-item > a", doc)[2])

			return {
				"name": link.text(),
				"currentMangaURL": link.attr('href'),
				"currentChapterURL": curUrl
			}
        },
    
        getListImages: async function (doc, curUrl) {
            let res = []
            $(`img.chapter-img`, doc).each(function() {
                res.push($(this).attr('data-original'))
            })
			return res
        },
    
        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
    
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(`img.chapter-img`, doc).length > 0
        }
    });
}