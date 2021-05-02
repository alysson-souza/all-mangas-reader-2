if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga Katana",
        mirrorIcon: "mangakatana.png",
        languages: "en",
        domains: ["mangakatana.com"],
        home: "https://mangakatana.com",
        chapter_url: /\/manga\/.*\/(c|v)/g,

        getMangaList : async function (search) {
            let url = this.home + "/?search=" + search
            
            let res = this.getMangaListPage(url)
            return res
        },

        getMangaListPage: async function(url) {
            let doc = await amr.loadPage(url, { nocache: true, preventimages: true })
            let res = []
            let self = this

            $("#book_list h3 a", doc).each(function (index) {
                res.push([
                    $(this).text(),
                    $(this).attr("href")
                ])
            })

            if ($('ul.uk-pagination', doc).length && $('ul.uk-pagination a.next', doc).length) {
                let nextPage = $($('ul.uk-pagination a.next', doc)[0]).attr('href')
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

            $('td .chapter a', doc).each(function (index) {
                res.push([
                    $(this).text().trim(), 
                    $(this).attr("href")]);
            })

            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mg = $('#breadcrumb_wrap a:last', doc)
            return {
                "name": mg.text(),
                "currentMangaURL": mg.attr("href"),
                "currentChapterURL": curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let txt = $("#__amr_text_dom__", doc).text()
            let a = txt.match(/ytaw=\[.+?\];/g)[0]
            let b = a.replace('ytaw=[', '[').replace(',];', ']').replace(/'/g, '"')
            let res = JSON.parse(b)
            
            console.log('Images')
            console.log(res)

            return res;
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("#imgs img", doc).length > 0;
        }
    })
}