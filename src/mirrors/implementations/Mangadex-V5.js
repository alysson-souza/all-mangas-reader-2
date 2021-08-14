if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "MangaDex V5",
        canListFullMangas: false,
        mirrorIcon: "mangadex.png",
        languages: ['en', "sa", "bd", "bg", "ct", "cn", "hk", "cz", "dk", "nl", "gb", "ph", "fi", "fr", "de", "gr", "hu", "id", "it", "jp", "kr", "my", "mn", "ir", "pl", "br", "pt", "ro", "ru", "rs", "es", "mx", "se", "th", "tr", "ua", "vn"].join(","),
        domains: ["*.mangadex.org", "mangadex.org"],
        home: "https://mangadex.org/",
        chapter_url: /\/chapter\/.*/g,
        api: "https://api.mangadex.org",
        pageLimit: 500, // Limit for paginated results

        checkAuthStatus: async function() {
            let response = await amr.loadJson(`${this.api}/auth/check`)
            return response.isAuthenticated || false
        },

        ensureLogin: async function() {
            let username = amr.getOption('MangadexUsername')
            let password = amr.getOption('MangadexPassword')

            if (username && password) {
                if (! await this.checkAuthStatus()) {
                    //
                    let response = await amr.loadJson(`${this.api}/auth/login`, {
                        post: true,
                        data: {
                            username,
                            password
                        }
                    })

                    if (response.result !== 'ok') {
                        console.log('Mangadex login failed')
                    } else {
                        console.log('Mangadex login success')
                    }
                }
            }
        },

        getMangaInfo: function(json) {
            let title = json.data.attributes.title.en;
            if (title === undefined) {
                title = Object.entries(json.data.attributes.title)[0][1]
                console.debug("no title en, using the default language")
            }
            title = $("<div>" + title + "</div>").text(); //html entites conversion
            return {
                title,
                url: `${this.home}title/${json.data.id}`
            }
        },

        getMangaList: async function(search) {
            let jsonSearch = await amr.loadJson(
                `${this.api}/manga/?title=${search}`
            )
            let res = jsonSearch.results.map(mangaJson => {
                let info  = this.getMangaInfo(mangaJson)
                return [
                    info.title,
                    info.url
                ]
            })
            return res
        },

        getListChaps: async function(urlManga) {
            // let blockedGroups = amr.getOption('mangadexBlockedGroups').split(',') || []
            // let mangadexDataSaver = amr.getOption('mangadexDataSaver')
            let id = urlManga.split('/')[4]
            let jsonChapFeed
            let res = {}
            let done = [] // to avoid duplicate chapters. pick randomly a version
            let finished = false
            let page = 0

            while (!finished) {
                jsonChapFeed = await amr.loadJson(
                    `${this.api}/manga/${id}/feed?limit=${this.pageLimit}&order[chapter]=desc&offset=${page * this.pageLimit}`
                )
                
                jsonChapFeed.results
                    .filter(data => data.result === "ok")
                    .map(data => data.data)
                    .forEach(chap => {
                        let attributes = chap.attributes;
                        let lang = attributes.translatedLanguage;

                        if (attributes.chapter && done.indexOf(lang + attributes.chapter) >= 0) return;
                        done.push(lang + attributes.chapter)

                        if (!res[lang]) res[lang] = []

                        let titleParts = []

                        if (attributes.chapter && attributes.chapter.length > 0)
                            titleParts.push(attributes.chapter)

                        if (attributes.title && attributes.title.length > 0)
                            titleParts.push(attributes.title)

                        res[lang].push([
                            titleParts.length > 0 ? titleParts.join(' - ') : 'Untitled',
                            `${this.home}chapter/${chap.id}`
                        ])

                        
                    })
                page++

                if (parseInt(jsonChapFeed.limit) + parseInt(jsonChapFeed.offset) >= parseInt(jsonChapFeed.total) || page > 15) {
                    finished = true
                } else {
                    await new Promise(r => setTimeout(r, 250))
                }
            }
            
            return res
        },

        getInformationsFromCurrentPage: async function(doc, curUrl) {

            let chapterId = curUrl.split('/')[4]

            let chapterJson = await amr.loadJson(`${this.api}/chapter/${chapterId}`)
            if (chapterJson.result !== "ok") {
                console.error("error during call url", `${this.api}/chapter/${chapterId}`)
                console.log(chapterJson)
                return []
            }
            let chapData = chapterJson.data
            let mangaId = chapterJson.relationships.filter(rel => rel.type === "manga")[0].id
            let mangaJson = await amr.loadJson(`${this.api}/manga/${mangaId}`)
            let res = {}

            let mangaInfo = this.getMangaInfo(mangaJson)
            
            res.name = mangaInfo.title
            res.currentMangaURL = mangaInfo.url
            res.currentChapterURL = curUrl.split('/').slice(0, 5).join('/')
            res.language = chapData.attributes.translatedLanguage;
            return res;
        },

        getListImages: async function(doc, curUrl) {
            let chapterId = curUrl.split('/')[4]

            let chapterJson = await amr.loadJson(`${this.api}/chapter/${chapterId}`)
            let serverInfo = await amr.loadJson(`${this.api}/at-home/server/${chapterId}`)

            if (chapterJson.result !== "ok") {
                console.error("error during call url", curUrl)
                console.log(chapterJson)
                return [];
            }
            let chapData = chapterJson.data
            let res = []
            let url = `${serverInfo.baseUrl}/data/${chapData.attributes.hash}`
            
            chapData.attributes.data.forEach(id => {
                res.push(`${url}/${id}`)
            })

            return res
        },

        getImageFromPageAndWrite: function(urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function(doc, curUrl) {
            return curUrl.split("/")[3] === "chapter"
        }
    });
}