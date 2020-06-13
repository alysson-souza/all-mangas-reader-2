if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Manga4Life",
        canListFullMangas : true,
        mirrorIcon : "manga4life.png",
        languages : "en",
        domains: ["manga4life.com"],
        home: "https://manga4life.com",
        chapter_url: /^\/read-online\/.*$/g,

        getMangaList : async function (search) {
            let doc = await amr.loadPage(this.home + "/directory/", { nocache: true, preventimages: true })
            let res = []
            let self = this

            let regex = /(?<=vm\.FullDirectory = ).*?(?=};)/g
            let matches = regex.exec(doc.innerText)
            let directory = JSON.parse(matches[0] + '}')

            directory.Directory.forEach(manga => {
                res.push([
                    manga.s,
                    self.home + '/manga/' + manga.i
                ])
            })
            return res
        },
    
        getListChaps : async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this

            let regex = /(?<=vm\.Chapters = ).*?(?=;)/g
            let matches = regex.exec(doc.innerText)
            let chapters = JSON.parse(matches[0])

            regex = /(?<=vm\.IndexName = ").*?(?=";)/g
            matches = regex.exec(doc.innerText)
            let titlePath = matches[0]

            
            chapters.forEach(chapter => {
                let linkPart = self.ChapterListLink(chapter.Chapter)
                let name = self.ChapterListName(chapter.Type, chapter.Chapter)

                res.push([
                    name,
                    self.home + '/read-online/' + titlePath + linkPart
                ])
            })
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var mgtitle = $($('.MainContainer a[href*="manga"]', doc)[0])
            return {
                "name" : mgtitle.text().trim().split("\n")[0].trim(),
                "currentMangaURL" : this.home + mgtitle.attr("href"),
                "currentChapterURL" : curUrl
            };
        },
    
        getListImages : async function (doc, curUrl) {
            let fullUrl = curUrl.replace('-page-1.html', '.html')
            doc = await amr.loadPage(fullUrl, { nocache: true})

            let regex = /(?<=vm\.CurChapter =).*?(?=;)/g
            let matches = regex.exec(doc.innerText)
            let vars = JSON.parse(matches[0])

            regex = /(?<=vm\.CurPathName = ").*?(?=";)/g
            matches = regex.exec(doc.innerText)
            let cdnPath = matches[0]

            regex = /(?<=vm\.IndexName = ").*?(?=";)/g
            matches = regex.exec(doc.innerText)
            let titlePath = matches[0]


            let res = []
            let chapImage = this.ChapterImage(vars.Chapter)
            let extraDir = vars.Directory == '' ? '' : vars.Directory + '/'
            for(i=1; i <= vars.Page; i++){
                let pageImage = this.PageImage(i)
                res.push(`https://${cdnPath}/manga/${titlePath}/${extraDir}/${chapImage}-${pageImage}.png`)
            }
            return res
        },

        ChapterListLink: function(id) {
            let stupidvar1 = id.substr(0, 1)
            let chapterNumber = parseInt(id.slice(1, -1))
            let chapterPart = id.slice(-1)
            let index = stupidvar1 != 1 ? '-index-' + stupidvar1 : ''
            let chapterPartDisplay = chapterPart != 0 ? '.' + chapterPart : ''

            return '-chapter-' + chapterNumber + chapterPartDisplay + index +  '.html'
        },

        ChapterListName: function(type, id) {
            let blah = (type != '' ? type : 'Chapter') + ' '
            let chapterNumber = parseInt(id.slice(1, -1))
            let chapterPart = id[id.length - 1]
            return (blah + (chapterPart == 0 ? chapterNumber : chapterNumber + '.' + chapterPart)).trim()
        },

        ChapterImage : function(ChapterString){
            var Chapter = ChapterString.slice(1,-1)
            var Odd = ChapterString.slice(-1)
            if(Odd == 0){
                return Chapter
            }else{
                return Chapter + "." + Odd
            }
        },

        PageImage : function(PageString){
            var s = "000" + PageString;
            return s.substr(s.length - 3)
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
        
        isCurrentPageAChapterPage : function (doc, curUrl) {
            return $("div.ImageGallery", doc).length > 0
        }
    })
}