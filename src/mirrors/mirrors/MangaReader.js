if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga Reader",
        canListFullMangas: false,
        mirrorIcon: "mangareader.png",
        domains: ["www.mangareader.net"],
        home: "http://www.mangareader.net",
        chapter_url: /\/.*\/[0-9]+.*/g,
        languages: "en",
    
        getMangaList: async function (search) {
            let res = await this.searchPage(this.home + "/search/?nsearch=" + search + "&msearch=")
            return res
        },

        searchPage: async function(url) {
            let doc = await amr.loadPage(url, { nocache: true, preventimages: true })
            let self = this
            let res = []
            $(".d57 a", doc).each(function (index) {
                res.push([
                    $(this).text(),
                    self.home + $(this).attr("href")
                ])
            })

            let nextPage = $(".d71 a:contains('>')", doc)
            if (nextPage.length > 0) {
                res = [...res, ...await this.searchPage(self.home + nextPage.attr('href'))]
            }
            return res
        },
    
        getListChaps: async function (urlManga) {
            if (urlManga.indexOf("http://") == 0) urlManga = "http://" + urlManga.substring(7);
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let self = this
            var res = []
            var mangaName = $(".d41 .name", doc).text().replace("Manga", "").trim();
            $(".d48 a", doc).each(function (index) {
                res.push([
                    $(this).text().replace(mangaName, "").trim(), 
                    self.home + $(this).attr("href")
                ])
            })
            res = res.reverse()
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let nameLink = $($(".d43 a", doc)[0])
            var name = nameLink.text().replace("Manga", "").trim()
            var mangaurl = this.home  + nameLink.attr("href");
            return {
                "name": name,
                "currentMangaURL": mangaurl,
                "currentChapterURL": curUrl
            };
        },
    
        getListImages: async function (doc, curUrl) {
            let res = []
            let regex = /<script>(.*?)<\/script>/g
            let matches = regex.exec(doc.innerText)
            let json = JSON.parse(matches[1].replace('document["mj"]=', ''))
            console.log(json)

            json.im.forEach(elem => res.push(elem.u))
            
            console.log(res)
            return res
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("img#ci", doc).length > 0
        }
    })
}