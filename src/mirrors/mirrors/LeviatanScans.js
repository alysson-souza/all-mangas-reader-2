if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Leviatan Scans',
        canListFullMangas: true,
        mirrorIcon: 'leviatan.png',
        languages: 'en',
        domains: ['leviatanscans.com'],
        home: 'https://leviatanscans.com/',

        getMangaList: async function(search) {
            let doc = await amr.loadPage('https://leviatanscans.com/comics?query=' + search, {
                nocache: true,
                preventimages: true,
            });
            let res = [];
            $('div.row.mb-4 > div > div > div.list-content > div.list-body > a', doc).each(function(
                index
            ) {
                res.push([
                    $(this)
                        .text()
                        .trim(),
                    $(this).attr('href'),
                ]);
            });
            return res;
        },

        getListChaps: async function(urlManga) {
            let doc = await amr.loadPage(urlManga, {
                nocache: true,
                preventimages: true,
            });

            let res = [];
            $('div.card.p-4 > div > div > div > a.item-author.text-color', doc).each(function() {
                let url = $(this).attr('href');
                res.push([$(this).text(), url]);
            });
            return res;
        },

        getInformationsFromCurrentPage: async function(doc, curUrl) {
            let parts = curUrl.split('/');
            return {
                name: $('div.heading > h6', doc)
                    .text()
                    .trim(),
                currentMangaURL: parts.slice(0, 5).join('/'),
                currentChapterURL: curUrl,
            };
        },

        getListImages: async function(doc, curUrl) {
            let res = [];

            let tmp_script = doc.innerText.split('window.chapterPages = ')[1];
            tmp_script = tmp_script.split(';window.nextChapter')[0];

            tmp_script.match(/([\w\.\\/]+)/g).forEach(function(item) {
                res.push('https://leviatanscans.com' + item.replace(/\\/g, ''));
            });
            return res;
        },

        getImageFromPageAndWrite: async function(urlImg, image) {
            $(image).attr('src', urlImg);
        },

        isCurrentPageAChapterPage: function(doc, curUrl) {
            return $('h6.page-section-title', doc).length > 0;
        },
    });
}
