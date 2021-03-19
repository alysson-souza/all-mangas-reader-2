if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "LHTranslations",
        canListFullMangas : true,
        mirrorIcon : "lhtranslation.png",
        languages : "en",
        domains: ["lhtranslation.net"],
        home: "https://lhtranslation.net",
        chapter_url: /^\/chapter-.+$/g,

        getMangaList : async function (search) {
            // "manga-list.html?listType=pagination&page=2&artist=&author=&group=&m_status=&name=&genre=&ungenre=&sort=name&sort_type=ASC"
            let res = []
            res = await this.listFromPage(1)
            return res
        },

        listFromPage: async function(page) {
            let res = []
            let self = this
            // Base url
            let url = new URL(this.home + '/manga-list.html?listType=pagination&page=1&artist=&author=&group=&m_status=&name=&genre=&ungenre=&sort=name&sort_type=ASC')
            url.searchParams.set('page', page)

            let doc = await amr.loadPage(url.href, { nocache: true, preventimages: true })

            let nextPageUrl = new URL(this.home + '/' + $('a[href*="manga-list.html"] i.glyphicon-chevron-right', doc).parent().attr('href'))
            let nextPageNumber = parseInt(nextPageUrl.searchParams.get('page'))
            
            $('div.media h3[id="tables"] a', doc).each(function () {
                res.push([$(this).text(), self.home + '/' + $(this).attr('href')]);
            });

            if (nextPageNumber > page) {
                res = [...res, ...await this.listFromPage(page + 1)]
            }
            return res
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            let title = $('h1', doc).text().trim()
            $('a.chapter', doc).each(function (index) {
                res.push([$(this).text().replace(title, '').trim(), self.home + '/' + $(this).attr('href')])
            });
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            let seriesLink = $('div.navbar-header a', doc)
            return {
                "name" : seriesLink.text().trim(),
                "currentMangaURL" : seriesLink.attr('href'),
                "currentChapterURL" : curUrl
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let res = []
            $('img.chapter-img', doc).each(function() {
                res.push($(this).attr('src'))
            })
            return res
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $('img.chapter-img', doc).length > 0;
        }
    })
}