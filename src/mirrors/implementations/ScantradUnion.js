if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Scantrad Union",
        canListFullMangas : true,
        mirrorIcon : "scantradunion.png",
        languages : "fr",
        domains: ["scantrad-union.com"],
        home: "https://scantrad-union.com/",
        chapter_url: /^\/read\/.+\/chapter-.+/g,

        getMangaList : async function (search) {
            let doc = await amr.loadPage(this.home + "wp-admin/admin-ajax.php",{
                nocache: true,
                preventimages: true,
                post: true,
                data: {
                    action: "ajaxsearchpro_search",
                    aspp: search,
                    asid: "1",
                    asp_inst_id: "1_1",
                    options: "current_page_id=7944&qtranslate_lang=0&asp_gen%5B%5D=title&customset%5B%5D=manga"
                }
            })
            let res = []
            $("a.asp_res_url", doc).each(function () {
                res.push([
                    $(this).text().trim(),
                    $(this).attr('href')
                ])
            })
            return res
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $(".accordionItemContent li", doc).each(function (index) {
                res.push([
                    $('.chapter-number', this).text().replace('#', '').trim(),
                    $('a:contains("Lire")', this).attr('href')
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            return {
                "name" : $('#manga-title', doc).text().trim(),
                "currentMangaURL" : this.home + 'manga/' + curUrl.split('/')[4] + '/',
                "currentChapterURL" : curUrl.split("/").slice(0, 8).join("/")
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let res = []
            $("#webtoon img", doc).each(function (index) {
                res.push($(this).attr('data-src'))
            })
            return res
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $("#webtoon img", doc).length > 0;
        }
    })
}