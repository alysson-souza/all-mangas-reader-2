if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Batoto (fake)",
        mirrorIcon : "batoto.png",
        languages : "en",
        domains: ["bato.to", "batotoo.com", "comiko.net"],
        home: "https://bato.to",
        chapter_url: /^\/chapter\/.+$/g,

        getMangaList : async function (search, url = null) {
            let doc
            if (url) 
                doc = await amr.loadPage(this.home + '/search?word=' + search, { nocache: true, preventimages: true })
            else
                doc = await amr.loadPage(url, { nocache: true, preventimages: true })

            let res = []
            let self = this

            $("a.item-title[href*='/series/']", doc).each(function () {
                res.push([
                    $(this).text().trim(),
                    self.home + $(this).attr('href')
                ])
            })
            let nextPage = $('li.page-item:last', doc)
            if (!nextPage.hasClass('disabled')) {
                res.push(...await self.getMangaList('', self.home + nextPage.find('a').attr('href')))
            }
            return res
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            $(".main a.chapt", doc).each(function (index) {
                res.push([
                    $(this).text(),
                    self.home + $(this).attr('href')
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var mgtitle = $($("h3.nav-title a", doc)[0])
            return {
                "name" : mgtitle.text(),
                "currentMangaURL" : this.home + mgtitle.attr("href"),
                "currentChapterURL" : curUrl.split("/").slice(0, 5).join("/")
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let images = amr.getVariable("images", doc)
            let server = amr.getVariable('server', doc)
            regex = /const batojs = (.*?);/g
            matches = regex.exec(doc.innerText)
            let key = eval(matches[1])

            let cdnPath =  JSON.parse(amr.crypto.AES.decrypt(server, key).toString(amr.crypto.enc.Utf8))
            return images.map(image => cdnPath + image)
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $("div#viewer", doc).length > 0
        }
    })
}
