if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Realm Scans",
        canListFullMangas: false,
        mirrorIcon: "realm-scans.webp",
        domains: ["realmscans.com"],
        home: "https://realmscans.com/",
        chapter_url: /chapter-[0-9]+\/$/g,
        languages: "en",

        abstract: "MangaStream_1_1_4Abs",
        abstract_options: {
            base_url: "https://realmscans.com/",
            series_list_selector: '.listupd a[href*="/series/"]',
            chapter_list_selector: `.eph-num a[href*="realmscans.com"]`
        }

        // // Mangastream 1.1.4 - Add abstract
        // getMangaList : async function (search) {
        //     let res = []
        //     let urlManga = this.home + "?s=" + search;
        //     let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })

        //     $('.listupd a[href*="/series/"]', doc).each(function (index) {
        //         res.push([
        //             $(this).find('.tt').text().trim(),
        //             $(this).attr("href")
        //         ])
        //     })
        //     return res
        // },

        // getListChaps : async function (urlManga) {
        //     let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        //     let res = []
        //     $(`.eph-num a[href*="${this.domains[0]}"]`, doc).each(function (index) {
        //         res.push([
        //             $('.chapternum', this).text().trim(),
        //             $(this).attr('href')
        //         ])
        //     });
        //     return res
        // },

        // getInformationsFromCurrentPage : async function (doc, curUrl) {
        //     var mgtitle = $(".allc a", doc)
        //     return {
        //         "name" : mgtitle.text(),
        //         "currentMangaURL" : mgtitle.attr("href"),
        //         "currentChapterURL" : curUrl
        //     };
        // },

        // getListImages : async function (doc, curUrl) {
        //     let res = []

        //     let regex = /ts_reader\.run\((.*?)\);/g
        //     let parts = doc.innerText.match(regex)
        //     let json = JSON.parse(parts[0].replace('ts_reader.run(', '').replace(');', ''))

        //     json.sources.forEach(source => {
        //         source.images.forEach(image => {
        //             res.push(image)
        //         })
        //     })
        //     return res
        // },

        // getImageFromPageAndWrite : async function (urlImg, image) {
        //     $(image).attr("src", urlImg)
        // },

        // isCurrentPageAChapterPage : function (doc, curUrl) {
        //     return $("div#readerarea", doc).length > 0
        // }
    })
}
