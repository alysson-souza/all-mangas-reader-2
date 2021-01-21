if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "MangaDex",
        canListFullMangas: false,
        mirrorIcon: "mangadex.png",
        languages: ["sa", "bd", "bg", "ct", "cn", "hk", "cz", "dk", "nl", "gb", "ph", "fi", "fr", "de", "gr", "hu", "id", "it", "jp", "kr", "my", "mn", "ir", "pl", "br", "pt", "ro", "ru", "rs", "es", "mx", "se", "th", "tr", "ua", "vn"].join(","),
        domains: ["*.mangadex.org", "mangadex.org"],
        home: "https://www.mangadex.org/",
        chapter_url: /\/chapter\/.*/g,
        api: "https://api.mangadex.org/v2/",
        
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

        getListChaps: async function (urlManga) {
            let amrOptions = window['AMR_STORE'].state.options
            let blockedGroups = amrOptions.mangadexBlockedGroups.split(',') || []
            console.log('Blocked Groups')
            console.log(blockedGroups)
            let id = urlManga.split("/")[4]
            let json = await amr.loadJson(this.api + "manga/" + id + "/chapters")
            let ut = Math.round((new Date()).getTime() / 1000)
            let chaps = json.data.chapters
            let res = {}
            let done = [] // to avoid duplicate chapters. pick randomly a version
            chaps.forEach(chap => {
                let blockedGroup = false
                chap.groups.forEach((group) => {
                    console.log('Checking group ' + group)
                    if (blockedGroups.includes(group + "")) {
                        console.log('Found Blocked group ' + group)
                        blockedGroup = true
                    }
                })
                if (blockedGroup) return

                if (done.indexOf(chap.language + chap.chapter) >= 0) return;
                if (!res[chap.language]) res[chap.language] = []
                done.push(chap.language + chap.chapter)
                if (chap.timestamp > ut) return // Skip chapters that are delayed
                res[chap.language].push([
                    (chap.chapter.length > 0 ? chap.chapter + " - " : "") + chap.title, 
                    "https://mangadex.org/chapter/" + chap.id
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
            let amrOptions = window['AMR_STORE'].state.options
            let chid = curUrl.split("/")[4]

            let url = this.api + "chapter/" + chid + "?"
            let params = new URLSearchParams()
            if (amrOptions.mangadexDataSaver) {
                params.append("saver", "true")
            }
            if (amrOptions.mangadexImageServer !== 'none') {
                params.append("server", amrOptions.mangadexImageServer)
            }

            url += params.toString()

            let chapter = await amr.loadJson(url )
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