if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "MangaStream",
        canListFullMangas: true,
        mirrorIcon: "mangastream.png",
        languages: "en",
        domains: ["mangastream.com","readms.com","readms.net"],
        home: "http://readms.net/",
        chapter_url: /^\/r\/.+$/g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://readms.net/manga", { nocache: true, preventimages: true })
            let res = [];
            $('.table-striped strong a', doc).each(function (index) {
                res[index] = [$(this).text().trim(), "https://readms.net" + $(this).attr('href')];
            });
           return res;
        },
    
        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            $('.table-striped a', doc).each(function () {
                res[res.length] = [$(this).text().trim(), "https://readms.net" + $(this).attr("href")];
            });
            return res;
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            var name = $('.dropdown-toggle .hidden-sm:first', doc).text(),
                currentMangaURL = "https://readms.net" + $('.btn-group .dropdown-menu:first a:last', doc).attr('href'),
                currentChapterURL = "https://readms.net" + $('.dropdown-menu:last a:first', doc).attr('href');
            return {
                "name": name,
                "currentMangaURL": currentMangaURL,
                "currentChapterURL": currentChapterURL
            }
        },
    
        getListImages: async function (doc, curUrl) {
            var res = [];
            var last = $('.dropdown-menu:last li a:last', doc);
            var npages = parseInt(last.text().replace(/[^0-9]/g, ''));
            var baseUrl = last.attr('href').replace(/\/[^/]*$/g, '/');
            while (npages > 0)
            {
                res[npages - 1] = "https://readms.net" + baseUrl + npages;
                npages--;
            }
            return res;
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            let doc = await amr.loadPage(urlImg)
            src = "https:" + $("img#manga-page", doc).attr("src");
            $(image).attr("src", src);
        },
    
        whereDoIWriteScans: function (doc, curUrl) {
            return $(".scanAMR", doc);
        },
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return ($("#manga-page", doc).length > 0);
        },
        doSomethingBeforeWritingScans: function (doc, curUrl) {
            $(".page", doc).empty();
            $(".page", doc).css("width", "auto");
            $(".sub-nav", doc).hide();
            $(".page", doc).append("<div class='navAMR'></div>");
            $(".page", doc).append("<div class='scanAMR'></div>");
            $(".page", doc).append("<div class='navAMR'></div>");
            $(".navAMR", doc).css("text-align", "center");
        },
        doAfterMangaLoaded: function (doc, curUrl) {
            $("body > div:empty", doc).remove();
        }
    })
}