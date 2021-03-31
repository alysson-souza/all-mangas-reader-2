if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Komga",
        canListFullMangas: true,
        mirrorIcon: "komga.webp",
        languages: "en",
        domains: ['komga'],
        home: 'komga',
        chapter_url: /\/book\/.*?\/read/g,

        apiUrl: function() {
            return new URL('/api/v1/', amr.getOption('komgaUrl'))
        },

        apiCall: async function(url) {
            headers = new Headers()
            headers.set('Authorization', 'Basic ' + 
                btoa(amr.getOption('komgaUser') + ":" + amr.getOption('komgaPassword')))
            
            let resp = await fetch( this.apiUrl() + url)
            return resp.json()
        },
        
        getMangaList: async function (search) {
            let list = await this.apiCall('series')
            let res = []
            let self = this
            list.content.forEach(res => {
                res.push([
                    res.name,
                    amr.getOption('komgaUrl') + '/series/' + res.id
                ])
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let id = urlManga.split("/").pop()
            let res = []
            let self = this

            let list = await this.apiCall('series/' + id + '/books')
            list.content.forEach(chap => {
                res.push([
                    chap.name,
                    amr.getOption('komgaUrl') + '/book/' + chap.id + '/read'
                ])
            })
            res.reverse()
            console.log(res)
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let id = curUrl.split("/")[4]

            let manga = await this.apiCall('books/' + id)
            let series = await this.apiCall('series/' + manga.seriesId)
            let res = {
                name: series.name,
                currentMangaURL: amr.getOption('komgaUrl') + '/series/' + series.id,
                currentChapterURL: amr.getOption('komgaUrl') + '/book/' + id + '/read'
            }
            return res
        },
    
        getListImages: async function (doc, curUrl) {
            let id = curUrl.split("/")[4]
            let res = []
            let self = this

            let pages = await this.apiCall('books/' + id + '/pages')
            pages.forEach(page => {
                res.push(self.apiUrl() + 'books/' + id + '/pages/' + page.number)
            })
            
            return res
        },
    
        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
    
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return curUrl.split("/")[5] === "read"
        }
    });
}