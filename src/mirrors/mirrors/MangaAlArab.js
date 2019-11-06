if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Manga Al-arab",
        canListFullMangas: false,
        mirrorIcon: "mangaae.png",
        languages: "ar",
        domains: ["www.manga.ae"],
        home: "https://www.manga.ae/",
        chapter_url: /^\/.*\/[0-9]+.*$/g,

        test_options: {
            user_agent: "Mozilla/5.0"
        },
    
        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://www.manga.ae/manga/search%3A" + search, { 
                nocache: true, 
                preventimages: true,
                headers: {"user-agent": "Mozilla/5.0"} // if no user agent, manga al arab server failed 
            })
            let res = []
            $("#mangadirectory .mangacontainer", doc).each(function (index) {
                let a = $("a.manga:first", $(this))
                res.push([a.text(), a.attr("href")]);
            });
            return res
        },
    
        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { 
                nocache: true, 
                preventimages: true,
                headers: {"user-agent": "Mozilla/5.0"} // if no user agent, manga al arab server failed 
            })
            let res = [];
            $("ul.new-manga-chapters a.chapter", doc).each(function (index) {
                res.push([$(this).text(), $(this).attr("href")]);
            });
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mg = $(".showchapterdirectory .manga", doc)
            return {
                "name": mg.text(),
                "currentMangaURL": this.addTrailingSlash(mg.attr("href")),
                "currentChapterURL": this.addTrailingSlash($(".showchapterdirectory .chapter", doc).attr("href"))
            }
        },
        
        addTrailingSlash: function(url) {
            if (!url) return url
            if (url.lastIndexOf("/") !== url.length - 1) {
                return url + "/"
            }
            return url
        },

        getListImages: async function (doc, curUrl) {
            var res = [];
            $("#morepages a", doc).each(function (index) {
                res.push($(this).attr("href"));
            });
            return res;
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            let doc = await amr.loadPage(urlImg, {
                headers: {"user-agent": "Mozilla/5.0"} // if no user agent, manga al arab server failed 
            })
            var src = $("#showchaptercontainer img", doc).attr("src");
            $(image).attr("src", src);
        },
    
        whereDoIWriteScans: function (doc, curUrl) {
            return $(".amr-container", doc);
        },
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("#showchaptercontainer img", doc).length > 0;
        },
        doSomethingBeforeWritingScans: function (doc, curUrl) {
            let nav = $("#navbar", doc)
            while (nav.next() && !nav.next().is(".footer")) {
                nav.next().remove()
            }
            nav.after($("<div class='amr-container'></div>"))
        },
        doAfterMangaLoaded: function (doc, curUrl) {
        }
    })
}
