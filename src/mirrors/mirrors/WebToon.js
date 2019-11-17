if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "WebToons",
        canListFullMangas : false,
        mirrorIcon : "webtoons.png",
        languages : "en",
        domains: ["www.webtoons.com"],
        home: "https://www.webtoons.com/",
        chapter_url: /^.*\/viewer.*$/g,

        getMangaList : async function (search) {
            let doc = await amr.loadPage(
                "https://www.webtoons.com/search?keyword=" + search, 
                { nocache: true, preventimages: true }
            )
            let res = [];
            $(".challenge_lst li a, .card_lst li a", doc).each(function (index) {
                res.push([$(".subj", $(this)).text().trim(), "https://www.webtoons.com" + $(this).attr("href")]);
            });
            return res;
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            $(".detail_lst li > a", doc).each(function (index) {
                res.push([$(".tx", $(this)).text().trim() + " - " + $(".subj", $(this)).text().trim(), $(this).attr("href")]);
            });
            while ($(".paginate > a[href='#']", doc).next().length > 0) {
                let nextpage = "https://www.webtoons.com" + $(".paginate > a[href='#']", doc).next().attr("href")
                doc = await amr.loadPage(nextpage, { nocache: true, preventimages: true })
                $(".detail_lst li > a", doc).each(function (index) {
                    res.push([$(".tx", $(this)).text().trim() + " - " + $(".subj", $(this)).text().trim(), $(this).attr("href")]);
                });
            }
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var name = $(".subj_info a", doc).text();
            var url = $(".subj_info a", doc).attr("href");
            return {
                "name" : name.trim(),
                "currentMangaURL" : url,
                "currentChapterURL" : curUrl
            };
        },
    
        getListImages : async function (doc, curUrl) {
            var res = [];
            $("#_imageList img", doc).each(function (index) {
                res.push($(this).attr("data-url"))
            });
            return res;
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage : function (doc, curUrl) {
            return ($("#_imageList img", doc).length > 0);
        }
    })
}