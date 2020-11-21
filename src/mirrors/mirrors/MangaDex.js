if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "MangaDex",
        canListFullMangas: false,
        mirrorIcon: "mangadex.png",
        languages: ["sa", "bd", "bg", "ct", "cn", "hk", "cz", "dk", "nl", "gb", "ph", "fi", "fr", "de", "gr", "hu", "id", "it", "jp", "kr", "my", "mn", "ir", "pl", "br", "pt", "ro", "ru", "rs", "es", "mx", "se", "th", "tr", "ua", "vn"].join(","),
        domains: ["*.mangadex.org", "mangadex.org"],
        home: "https://www.mangadex.org/",
        chapter_url: /\/chapter\/.*/g,
        api: "https://mangadex.org/api/v2/",
        
        getMangaList: async function (search) {
            let doc = await amr.loadPage(
                "https://mangadex.org/?page=search&title=" + search, 
                {preventimages: true }
            )
            res = [];
            $("a.manga_title", doc).each(function(ind) {
                res.push([
                    $(this).text(),
                    "https://mangadex.org/manga/" + $(this).attr("href").split("/")[2]
                ])
            })
            return res
        },
        //https://mangadex.org/manga/44246

        getListChaps: async function (urlManga) {
            let id = urlManga.split("/")[4]
            let json = await amr.loadJson(this.api + "manga/" + id + "/chapters")
            let ut = Math.round((new Date()).getTime() / 1000)
            let chaps = json.data.chapters
            let res = {}
            let done = [] // to avoid duplicate chapters. pick randomly a version
            chaps.forEach(chap => {
                if (chap.timestamp > ut) return // Skip chapters that are delayed
                
                if (done.indexOf(chap.language + chap.chapter) >= 0) { // If we are getting a dupe lets ensure its
                    let index = res[chap.language].findIndex(elem => elem[2] == chap.chapter)
                    if (res[chap.language][index][3] > chap.timestamp) { // We want the oldest chapter so remove this one
                        res[chap.language] = res[chap.language].splice(index, 1)
                    } else {
                        return
                    }
                }
                if (!res[chap.language]) res[chap.language] = [] // Create array for specified language
                done.push(chap.language + chap.chapter)
                res[chap.language].push([
                    (chap.chapter.length > 0 ? chap.chapter + " - " : "") + chap.title, 
                    "https://mangadex.org/chapter/" + chap.id,
                    chap.chapter,
                    chap.timestamp
                ]);
            })

            // sort each chaps list 
            let extractnum = a => Number(a.substr(0, a.indexOf(" "))) || -1
            for (let lang in res) {
                res[lang] = res[lang].sort((a, b) => {
                    return -(extractnum(a[0]) - extractnum(b[0]))
                })
            }
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let chid = curUrl.split("/")[4]
            let chapter = await amr.loadJson(this.api + "chapter/" + chid)
            let manga = await amr.loadJson(this.api + "manga/" + chapter.data.mangaId)
            let res = {}
            res.name = $("<div>" + manga.data.title + "</div>").text() // to transform html codes
            res.currentMangaURL = "https://mangadex.org/manga/" + chapter.data.mangaId
            res.currentChapterURL = "https://mangadex.org/chapter/" + chid
            res.language = chapter.data.language
            return res;
        },
    
        getListImages: async function (doc, curUrl) {
            let chid = curUrl.split("/")[4];
            let chapter = await amr.loadJson(this.api + "chapter/" + chid)
            if (chapter.data.server.indexOf("/") === 0) {
                chapter.data.server = "https://mangadex.org" + chapter.data.server
            }
            return chapter.data.pages.map(img => chapter.data.server + chapter.data.hash + "/" + img)
        },
    
        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
    
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return curUrl.split("/")[3] === "chapter" && curUrl.split("/")[5] !== "comments"
        }
    });
}