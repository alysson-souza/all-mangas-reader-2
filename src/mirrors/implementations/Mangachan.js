if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Mangachan",
        canListFullMangas: false,
        mirrorIcon: "Mangachan.png",
        languages: "ru",
        domains: ["mangachan.me"],
        home: "http://mangachan.me",
        chapter_url: /^\/online\/.+$/g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage("http://mangachan.me/engine/ajax/search.php",
                {
                    nocache: true,
                    post: true,
                    preventimages: true,
                    dataType: "text",
                    data: { query: search }
                })
            if ($(".notfound", doc).length) return [] //No mangas found
            let res = [];
            $("> a", doc).each(function (index) {
                res[res.length] = [
                    this.innerText,
                    this.getAttribute("href").replace(/mangachan\.me\/\//, "mangachan.me/manga/")
                ]
            })
            return res
        },
    
        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $(".manga a", doc).each(function (index) {
                res[res.length] = [
                    this.innerText.match(/\u00a0\u00a0(.*?)$/)[1],
                    "http://mangachan.me" + this.getAttribute("href")
                ]
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            var name_eng = doc.body.innerHTML.match(/"name"\s*:\s*"(.*?)"/)[1];
            var name_rus = doc.body.innerHTML.match(/"rus_name"\s*:\s*"(.*?)"/)[1];
            var manga_url = doc.body.innerHTML.match(/"content_id"\s*:\s*"(.*?)"/)[1];
            return {
                "name": name_eng + " " + name_rus,
                "currentMangaURL": "http://mangachan.me" + manga_url,
                "currentChapterURL": curUrl
            }
        },
    
        getListImages: async function (doc, curUrl) {
            var res = [];
            var fullimgStr = doc.body.innerHTML.match(/"fullimg"\s*:\s*(\[.*\]?)/)[1];
            fullimgStr = fullimgStr.replace(/,\]/, ']');
            res = JSON.parse(fullimgStr); 
            return res;
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage: async function (doc, curUrl) {
            return $("#image", doc).length > 0;
        }
    })
}