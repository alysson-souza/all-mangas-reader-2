if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'ManhuaPlus',
        canListFullMangas: true,
        mirrorIcon: 'manhuaplus.png',
        languages: 'en',
        domains: ['manhuaplus.com'],
        home: 'https://manhuaplus.com/',

        getMangaList: async function(search) {
            let doc = await amr.loadPage(
                'https://manhuaplus.com/?s=' + search + '&post_type=comics',
                {
                    nocache: true,
                    preventimages: true,
                }
            );

            let res = [];

            $('#ctl00_divCenter > div > div > div.items > div > div > figure > div > a', doc).each(
                function() {
                    res.push([
                        $(this)
                            .attr('title')
                            .trim(),
                        $(this).attr('href'),
                    ]);
                }
            );

            return res;
        },

        getListChaps: async function(urlManga) {
            let doc = await amr.loadPage(urlManga, {
                nocache: true,
                preventimages: true,
            });

            let res = [];
            $('#nt_listchapter > nav > ul > li > div.col-xs-5.chapter > a', doc).each(function() {
                let url = $(this).attr('href');
                let chap = $(this)
                    .text()
                    .trim();
                res.push([chap, url]);
            });
            return res;
        },

        getInformationsFromCurrentPage: async function(doc, curUrl) {
            let mga = $('div.top > h1 > a', doc);

            return {
                name: mga.text().trim(),
                currentMangaURL: mga.attr('href'),
                currentChapterURL: curUrl,
            };
        },

        getListImages: async function(doc, curUrl) {
            let res = [];

            $(
                '#ctl00_divCenter > div > div > div.reading-detail.box_doc.chapter-detail > figure > ul > li > figure > img',
                doc
            ).each(function() {
                if ($(this).attr('data-src')) res.push($(this).attr('data-src'));
            });

            return res;
        },

        getImageFromPageAndWrite: async function(urlImg, image) {
            $(image).attr('src', urlImg);
        },

        isCurrentPageAChapterPage: function(doc, curUrl) {
            return $('#ctl00_divCenter > div > div > div.top > h1 > a', doc).length > 0;
        },
    });
}
