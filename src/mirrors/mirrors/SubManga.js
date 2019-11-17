if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "SubManga",
        canListFullMangas: false,
        mirrorIcon: "submanga.png",
        languages: "es",
        domains: ["submanga.online", "submanga.com"],
        home: "https://submanga.online/",
        chapter_url: /^\/manga\/.*\/.*$/g,
        
        getMangaList: async function (search) {
            let doc = await amr.loadPage(
                "https://submanga.online/mangas/buscar", 
                {
                    preventimages: true,
                    data: {q:search},
                    post: true
                }
            )
            let res = []
            $(".panel-body .caption h3 a", doc).each(function (ind) {
                res.push([$(this).text(), "https://submanga.online" + $(this).attr("href")]);
            });
            return res
        },
    
        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $(".capitulos-list a", doc).each(function (index) {
                res[res.length] = [$(this).text(), "https://submanga.online" + $(this).attr("href")];
            })
            return res
        },
        
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            if ($("#boton.anterior", doc).length > 0) { // reading from reader
                let chapurl = $("meta[property='og:url']").attr("content");
                if (chapurl.indexOf("http:")) chapurl = chapurl.substring(4);
                if (chapurl.indexOf("https:")) chapurl = chapurl.substring(5); //reload reader from first page
                let docinit = await amr.loadPage(chapurl);
                let urlref = $("#boton.anterior", docinit).attr("href"); // button link is from main site
                let paths = urlref.split("/")
                return {
                    "name": $("a[href='" + urlref + "']", docinit).text(),
                    "currentMangaURL": paths.splice(0, paths.length - 1).join("/"),
                    "currentChapterURL": urlref
                }
            } else {
                let paths = curUrl.split("/")
                let name = $($(".panel-heading h3", doc)[0]).text().trim()
                if (name.endsWith("manga")) name = name.substring(0, name.length - 5).trim();
                return {
                    "name": name,
                    "currentMangaURL": paths.slice(0, paths.length - 1).join("/"),
                    "currentChapterURL": curUrl
                }
            }
        },
    
        getListImages: async function(doc, curUrl) {
            let getimgs = function(doc, url) {
                let res = []
                $("#select_paginas option", doc).each(function() {
                    res.push(url + "/" + $(this).val())
                })
                return res
            }
            let aredirect = $("a[href^='/mangas/leermanga/']", doc);
            if (aredirect.length === 1) { // reading from main site
                let url = "https://submanga.online" + aredirect.attr("href")
                let docred = await amr.loadPage(url, { nocache: true, preventimages: true })
                return getimgs(docred, url)
            } else { // reading from reader
                return getimgs(doc, $("meta[property='og:url']").attr("content"))
            }
        },
    
        getImageFromPageAndWrite: async function(urlImg, image) {
            let doc = await amr.loadPage(urlImg)
            var src = $("#page_img", doc).attr("src");
            $(image).attr("src", "https://submanga.online" + src);
        },
        
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("a[href^='/mangas/leermanga/']", doc).length > 0 || $("#page_img", doc).length > 0;
        }
    })
}