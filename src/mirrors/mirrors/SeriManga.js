if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Seri Manga",
        mirrorIcon: "serimanga.png",
        languages: "en",
        domains: ["serimanga.com"],
        home: "https://serimanga.com/",
        canListFullMangas: true,
        chapter_url: /^\/mangas\/.*\/[0-9]+.*$/g,

        getMangaList : async function (search) {
            let url = this.home + 'mangalar'
            let res = this.getMangaListPage(url)
            return res
        },

        getMangaListPage: async function(url) {
            let doc = await amr.loadPage(url, { nocache: true, preventimages: true })
            let res = []
            let self = this

            $('li.mangas-item a', doc).each(function (index) {
                res.push([
                    $('.mlb-name', $(this)).text().trim(),
                    $(this).attr("href")
                ])
            })

            if ($('ul.pagination', doc).length && $('ul.pagination a[rel="next"]', doc).length) {
                let nextPage = $($('ul.pagination a[rel="next"]', doc)[0]).attr('href')
                res.push(...await self.getMangaListPage(nextPage))
            }

            return res
        },
    
        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { 
                nocache: true, 
                preventimages: true,
            })
            let res = []
            let self = this

            $('li.spl-list-item a', doc).each(function (index) {
                res.push([
                    $('span:first', $(this)).text().trim(), 
                    $(this).attr("href")]);
            })

            if ($('ul.pagination', doc).length && $('ul.pagination a[rel="next"]', doc).length) {
                let nextPage = $($('ul.pagination a[rel="next"]', doc)[0]).attr('href')
                res.push(...await self.getListChaps(nextPage))
            }

            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mg = $($('div.rtm-logo a:last', doc)[0])
            let url = new URL(curUrl)
            return {
                "name": mg.text().trim(),
                "currentMangaURL": mg.attr("href"),
                "currentChapterURL": url.origin + url.pathname
            }
        },

        getListImages: async function (doc, curUrl) {
            let res = []
            let self = this
            $('div.reader-manga.chapter-pages img', doc).each(function (index) {
                res.push($(this).attr('src') || $(this).attr('data-src'))
            })
            return res
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $('div.reader-manga.chapter-pages img', doc).length > 0
        }
    })
}