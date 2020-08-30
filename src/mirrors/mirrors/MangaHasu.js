if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Manga Hasu",
        canListFullMangas : false,
        mirrorIcon : "mangahasu.webp",
        languages : "en",
        domains: ["mangahasu.se"],
        home: "http://mangahasu.se/",

        getMangaList : async function (search) {
            let res = []
            res = this.searchPage(this.home + "advanced-search.html?keyword=" + search)
            return res
        },

        searchPage: async function (url) {
            let doc = await amr.loadPage(url, { nocache: true, preventimages: true })
            let res = []
            $(".list_manga a.name-manga", doc).each(function () {
                res.push([
                    $(this).text().trim(),
                    $(this).attr('href')
                ])
            })

            let nextPage = $(".pagination-ct a:contains('Next →')", doc)
            if (nextPage.length > 0) { // Has pages
                res = [...res, ...await this.searchPage(nextpage.attr("href"))]
            }
            return res
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $(".list-chapter td.name a", doc).each(function (index) {
                $(this).find('span').remove()

                res.push([
                    $(this).text().trim(),
                    $(this).attr('href')])
            });
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var mgtitle = $(".content .div-breadcrumb a:last", doc)
            return {
                "name" : mgtitle.text().trim(),
                "currentMangaURL" : mgtitle.attr("href"),
                "currentChapterURL" : curUrl.split(".html")[0] + ".html"
            }
        },
    
        getListImages : async function (doc, curUrl) {
            let res = []
            $(".img-chapter img", doc).each(function(index) {
                res.push($(this).attr('src'))
            })
            return res
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $(".img-chapter img", doc).length > 0;
        }
    })
}