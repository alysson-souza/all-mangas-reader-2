if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga Llama",
        canListFullMangas: false,
        mirrorIcon: "mangallama.png",
        languages: "en",
        domains: ["mangallama.com"],
        home: "https://mangallama.com",
        chapter_url: /\/reader\/.*\/.*/g,
        
        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "/search.php?manga=" + search, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(`a[href*="/manga/"]`, doc).each(function(ind) {
                res.push([
                    $(this).text().trim(),
                    self.home + $(this).attr("href")
                ])
            })
            return res
            
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(`#chapsholder tbody td a[href*="/reader/"]`, doc).each(function (index) {
                res.push([
                    $(this).text().trim(),
                    self.home + $(this).attr("href")
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let link = $('#maintitle a', doc)
            let name = link.text()
            name = name.substring(0, name.indexOf('Chapter')).trim()
			return {
				"name": name,
				"currentMangaURL": this.home + link.attr('href'),
				"currentChapterURL": curUrl
			}
        },
    
        getListImages: async function (doc, curUrl) {
            let res = []
            $(`main img[width!="1px"]`, doc).each(function() {
                let src = $(this).attr('src') 
                if (!res.includes(src)) {
                    res.push(src)
                }
            })
			return res
        },
    
        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
    
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(`main img[width!="1px"]`, doc).length > 0
        }
    })
}