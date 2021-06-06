if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Komga",
        canListFullMangas: false,
        mirrorIcon: "komga.png",
        languages: "en",
        domains: ['komga'],
        home: 'komga',
        chapter_url: /\/book\/.*?\/read.*/g,

        apiUrl: function () {
            return new URL('/api/v1/', new URL(amr.getOption('komgaUrl')).href)
        },

        apiCall: async function (url) {
            const options = {
                headers:{
                    'Authorization':'Basic ' + btoa(amr.getOption('komgaUser') + ":" + amr.getOption('komgaPassword'))
                }
            }
            return await amr.loadJson(this.apiUrl() + url, options)
        },

        getMangaList: async function (search) {
            let list = await this.apiCall('series?search=' + search)

            return list.content.map(res => {
                return [
                    res.name,
                    new URL(amr.getOption('komgaUrl')).href + 'series/' + res.id
                ];
            });
        },

        getListChaps: async function (urlManga) {
            let id = urlManga.split("/").pop()
            let res = [];
            for (let page = 0, run = true; run; page++) {
                let list = await this.apiCall('series/' + id + '/books?page=' + page + '&size=500&sort=metadata.numberSort%2Cdesc')
                let mangas = list.content.map(chap => {
                    return [
                        chap.name,
                        new URL(amr.getOption('komgaUrl')).href + 'book/' + chap.id + '/read'
                    ]
                })
                res.push(...mangas)
                if(list.last){
                    run = false
                }
            }
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let id = curUrl.split("/")[4]

            let manga = await this.apiCall('books/' + id)
            let series = await this.apiCall('series/' + manga.seriesId)
            return {
                name: series.name,
                currentMangaURL: new URL(amr.getOption('komgaUrl')).href + 'series/' + series.id,
                currentChapterURL: new URL(amr.getOption('komgaUrl')).href + 'book/' + id + '/read'
            }
        },

        getListImages: async function (doc, curUrl) {
            let id = curUrl.split("/")[4]

            let pages = await this.apiCall('books/' + id + '/pages')
            return pages.map(page => this.apiUrl() + 'books/' + id + '/pages/' + page.number)
        },

        getImageFromPageAndWrite: function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return curUrl.split("/")[5].included("read")
        }
    });
}
