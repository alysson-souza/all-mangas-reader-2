if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "MangaDex",
        canListFullMangas: false,
        mirrorIcon: "mangadex.png",
        languages: ["sa", "bd", "bg", "ct", "cn", "hk", "cz", "dk", "nl", "gb", "ph", "fi", "fr", "de", "gr", "hu", "id", "it", "jp", "kr", "my", "mn", "ir", "pl", "br", "pt", "ro", "ru", "rs", "es", "mx", "se", "th", "tr", "ua", "vn"].join(","),
        domains: ["*.mangadex.org", "mangadex.org"],
        home: "https://www.mangadex.org/",
        chapter_url: /\/chapter\/.*/g,
        api: "https://www.mangadex.org/api/",
        
        getMangaList: async function (search) {
            let doc = await amr.loadPage(
                "https://mangadex.org/?page=search&title=" + search, 
                { nocache: true, preventimages: true }
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
    
        getInfo: async function (urlManga) {
            let id = urlManga.split("/")[4]
            let json = await amr.loadJson(this.api + "manga/" + id, { nocache: true })
            let info = json.manga
            return {
                artist: info.artist,
                picture: "https://mangadex.org" + info.cover_url,
                description: info.description,
                title: info.title
            }
        },

        getListChaps: async function (urlManga) {
            let id = urlManga.split("/")[4]
            let json = await amr.loadJson(this.api + "manga/" + id, { nocache: true })
            let ut = Math.round((new Date()).getTime() / 1000)
            let chaps = json.chapter
            let res = {}
            let done = [] // to avoid duplicate chapters. pick randomly a version
            for (let id in chaps) {
                let chap = chaps[id]
                let key = chap.lang_code + (chap.volume.length > 0 ? chap.volume + ":" : "") + (chap.chapter.length > 0 ? chap.chapter : chap.title)
                if (done.indexOf(key) >= 0) continue;
                if (!res[chap.lang_code]) res[chap.lang_code] = []
                done.push(key)
                if (chap.timestamp > ut) continue // Skip chapters that are delayed
                res[chap.lang_code].push([
                    (chap.volume.length > 0 ? "Vol " + chap.volume + " - Ch: " : "") + (chap.chapter.length > 0 ? chap.chapter + " - " : "") + chap.title, 
                    "https://mangadex.org/chapter/" + id,
                    chap.volume, // Needed for ordering but will be ignored downstream
                    chap.chapter // Needed for ordering but will be ignored downstream
                ]);
            }
            // sort each chaps list 
            let parseChapter = a => Number(a.length > 0 ? a : -1)
            let parseVolume = a => Number(a.length > 0 ? a : 0)
            for (let lang in res) {
                res[lang] = res[lang].sort((a, b) => {
                    let volNumberA = parseVolume(a[2])
                    let chapNumberA = parseChapter(a[3])
                    let volNumberB = parseVolume(b[2])
                    let chapNumberB = parseChapter(b[3])

                    if (volNumberA !== volNumberB) return -(volNumberA - volNumberB)
                    else return -(chapNumberA - chapNumberB)
                })
                // return -(extractnum(a[0]) - extractnum(b[0]))
            }
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let chid = curUrl.split("/")[4]
            let chapter = await amr.loadJson(this.api + "chapter/" + chid)
            let manga = await amr.loadJson(this.api + "manga/" + chapter.manga_id)
            let res = {}
            res.name = $("<div>" + manga.manga.title + "</div>").text() // to transform html codes
            res.currentMangaURL = "https://mangadex.org/manga/" + chapter.manga_id
            res.currentChapterURL = "https://mangadex.org/chapter/" + chid
            res.language = chapter.lang_code
            return res;
        },
    
        getListImages: async function (doc, curUrl) {
            let chid = curUrl.split("/")[4];
            let chapter = await amr.loadJson(this.api + "chapter/" + chid)
            if (chapter.server.indexOf("/") === 0) {
                chapter.server = "https://mangadex.org" + chapter.server
            }
            return chapter.page_array.map(img => chapter.server + chapter.hash + "/" + img)
        },
    
        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
    
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return curUrl.split("/")[3] === "chapter" && curUrl.split("/")[5] !== "comments"
        }
    });
}