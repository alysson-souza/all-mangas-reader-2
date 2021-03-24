if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga Llama",
        canListFullMangas: false,
        mirrorIcon: "mangallama.webp",
        languages: "en",
        domains: ["mangallama.com"],
        home: "https://mangallama.com/",
        chapter_url: /readmanga.php\?manga=/g,
        
        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "search.php?manga=" + search, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(`a[href*="manga.php"]`, doc).each(function(ind) {
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
            $(`div#chapscontainer tbody td a[href*="readmanga.php"]`, doc).each(function (index) {
                res.push([
                    $(this).text().trim(),
                    self.home + $(this).attr("href")
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let name = $('#titlecontainer', doc).text()
            name = name.substr(0, name.indexOf('Chapter')).trim()
			return {
				"name": name,
				"currentMangaURL": this.home + 'manga.php?manga=' + name.replace(/ /g, '-'),
				"currentChapterURL": curUrl
			}
        },
    
        getListImages: async function (doc, curUrl) {
            let res = []
            $(`#chapcontainer img[width!="1px"]`, doc).each(function() {
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
            return $(`#chapcontainer img`, doc).length > 0
        }
    })
}