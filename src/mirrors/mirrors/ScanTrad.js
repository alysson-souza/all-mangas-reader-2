if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Scan Trad",
        canListFullMangas: true,
        mirrorIcon: "scantrad.png",
        languages: "fr",
        domains: ["scantrad.fr"],
        home: "https://scantrad.fr/",
        chapter_url: /^\/mangas\/.*\/[0-9]+.*$/g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://scantrad.fr/mangas", { nocache: true, preventimages: true })
            let res = [];
            $('#projects-list a', doc).each(function (index) {
                res[index] = [$(".project-name", $(this)).text(), $(this).attr('href')];
            });
           return res;
        },
    
        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            $('#project-chapters-list li', doc).each(function () {
                res[res.length] = [$(".name-chapter", $(this)).text().trim(), $(".buttons a:first", $(this)).attr("href")];
            });
            return res;
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            var mg = $(".controls a.project-name", doc)
            return {
                "name": mg.text(),
                "currentMangaURL": mg.attr("href"),
                "currentChapterURL": $("select[name='project-chapter'] option:selected", doc).val()
            }
        },
    
        getListImages: async function (doc, curUrl) {
            let res = []
            $("select[name='chapter-page']:first option", doc).each(function() {
                res.push($(this).val())
            })
            return res
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            let doc = await amr.loadPage(urlImg)
            src = $(".image img", doc).attr("src");
            $(image).attr("src", src);
        },
    
        whereDoIWriteScans: function (doc, curUrl) {
            return $("#content", doc);
        },
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(".image img", doc).length > 0;
        },
        doSomethingBeforeWritingScans: function (doc, curUrl) {
            $("#content", doc).empty();
        },
        doAfterMangaLoaded: function (doc, curUrl) {
        }
    })
}