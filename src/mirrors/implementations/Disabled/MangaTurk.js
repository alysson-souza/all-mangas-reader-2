if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Manga Turk",
        canListFullMangas: true,
        mirrorIcon: "mangaturk.png",
        languages: "tr",
        domains: ["www.mangaoku.net"],
        home: "http://www.mangaoku.net/",
        /*no chapter_url, all urls are /any/ will be loaded everywhere... */
        disabled: true,
        getMangaList: async function (search) {
            let doc = await amr.loadPage("http://www.mangaoku.net/", { nocache: true, preventimages: true })
            let res = []
            $("select[name='manga'] option", doc).each(function (index) {
                if ($(this).val() !== "0") {
                    res[res.length] = [$(this).text(), "http://www.mangaoku.net/" + $(this).val()];
                }
            });
            return res
        },
    
        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            let mgpart = $("select[name='manga'] option:selected", doc).val()
            $("select[name='chapter'] option", doc).each(function (index) {
                res[res.length] = [$(this).text(), "http://www.mangaoku.net/" + mgpart + "/" + $(this).val()];
            });
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mg = $("select[name='manga'] option:selected", doc)
            let chpart = $("select[name='chapter'] option:selected", doc).val()
            return {
                "name": mg.text(),
                "currentMangaURL": "http://www.mangaoku.net/" + mg.val(),
                "currentChapterURL": "http://www.mangaoku.net/" + mg.val() + "/" + chpart
            }
        },

        getListImages: async function (doc, curUrl) {
            let mgpart = $("select[name='manga'] option:selected", doc).val()
            let chpart = $("select[name='chapter'] option:selected", doc).val()
            var res = [];
            $("select[name='page'] option", doc).each(function (index) {
                res[res.length] = "http://www.mangaoku.net/" + mgpart + "/" + chpart + "/" + $(this).val()
            });
            return res;
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            let doc = await amr.loadPage(urlImg)
            var src = "http://www.mangaoku.net/" + $("#manga_img", doc).attr("src");
            $(image).attr("src", src);
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("#manga_img", doc).length > 0 && $("#manga_img", doc).attr("src") !== "";
        }
    })
}
