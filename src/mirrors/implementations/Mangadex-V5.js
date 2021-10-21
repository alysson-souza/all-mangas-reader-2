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
            let title = json.attributes.title.en;
            if (title === undefined) {
                title = Object.entries(json.attributes.title)[0][1]
                console.debug("no title en, using the default language")
            }
            title = $("<div>" + title + "</div>").text(); //html entites conversion
            return {
                title,
                url: `${this.home}title/${json.id}`
            }
        },

        getMangaList: async function(search) {
            let jsonSearch = await amr.loadJson(
                `${this.api}/manga/?title=${search}`
            )
            let res = jsonSearch.data.map(mangaJson => {
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
            const id = urlManga.split('/')[4]
            const res = {}
            // Loop with 15 iterations at most
            for(const [page, emptyVal] of Array(15).entries()) {
                // fetch data
                const jsonChapFeed = await amr.loadJson(
                    `${this.api}/manga/${id}/feed?limit=${this.pageLimit}&order[chapter]=desc&offset=${page * this.pageLimit}&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic`
                )
                // Create Object representing results
                const uniq = jsonChapFeed.data./*filter(data => data.result === "ok").*/reduce((acc,o)=>{
                    if (!acc[o.attributes.chapter + o.attributes.translatedLanguage]) {
                        acc[o.attributes.chapter + o.attributes.translatedLanguage] = [];
                    }
                    acc[o.attributes.chapter + o.attributes.translatedLanguage].push(o);
                    return acc;
                }, {});
                // When chapter has multiple groups, only keep the oldest entry
                jsonChapFeed.data = Object.values(uniq)
                    .reduce((acc,list)=>{
                        list.sort((a,b)=>new Date(a.attributes.publishAt) - new Date(b.attributes.publishAt) && b.attributes.chapter - a.attributes.chapter);
                        acc.push(list[0]);
                        return acc;
                    }, [])
                    // Format data to be consumed
                    // .map(data => data.data)
                    .forEach(chap => {
                        const lang = chap.attributes.translatedLanguage
                        const attributes = chap.attributes
                        if(!res[lang]) res[lang] = []
                        const titleParts = []
                        if(attributes.chapter && attributes.chapter.length > 0) titleParts.push(attributes.chapter)
                        if(attributes.title) titleParts.push(attributes.title)
                        res[lang].push([
                            titleParts.length > 0 ? titleParts.join(' - ') : 'Untitled',
                            `${this.home}chapter/${chap.id}`
                        ])
                    })
                // Do we need to fetch the next page ?
                const current = parseInt(jsonChapFeed.limit) + parseInt(jsonChapFeed.offset)
                const total = parseInt(jsonChapFeed.total)
                // no => break;
                if(current >= total) break;
                // yes => wait 250ms before next iteration
                await new Promise(r => setTimeout(r, 250))
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
            let mangaId = chapData.relationships.filter(rel => rel.type === "manga")[0].id
            let mangaJson = await amr.loadJson(`${this.api}/manga/${mangaId}`)
            let res = {}

            let mangaInfo = this.getMangaInfo(mangaJson.data)
            
            res.name = mangaInfo.title
            res.currentMangaURL = mangaInfo.url
            res.currentChapterURL = curUrl.split('/').slice(0, 5).join('/')
            res.language = chapData.attributes.translatedLanguage;
            return res;
        },

        getListImages: async function(doc, curUrl) {
            const mangadexDataSaver = amr.getOption('mangadexDataSaver')
            const chapterId = curUrl.split('/')[4]

            const chapterJson = await amr.loadJson(`${this.api}/chapter/${chapterId}`)
            const serverInfo = await amr.loadJson(`${this.api}/at-home/server/${chapterId}`)

            if (chapterJson.result !== "ok") {
                console.error("error during call url", curUrl)
                console.log(chapterJson)
                return [];
            }

            const chapData = chapterJson.data.attributes
            
            if(mangadexDataSaver) {
                const url = `${serverInfo.baseUrl}/data-saver/${chapData.hash}`
                return chapData.dataSaver.map(id => `${url}/${id}`)
            } else {
                const url = `${serverInfo.baseUrl}/data/${chapData.hash}`
                return chapData.data.map(id => `${url}/${id}`)
            }
        },

        getImageFromPageAndWrite: function(urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function(doc, curUrl) {
            return curUrl.split("/")[3] === "chapter"
        }
    });
}
