if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Niceoppai',
        canListFullMangas: true,
        mirrorIcon: 'niceoppai.png',
        languages: 'th',
        domains: ['www.niceoppai.net'],
        home: 'http://www.niceoppai.net/',

        getMangaList: async function(search) {
            let doc = await amr.loadPage('http://www.niceoppai.net/manga_list/search/', {
                nocache: true,
                preventimages: true,
                post: true,
                data: {
                    cmd_wpm_wgt_mng_sch_sbm: 'Search',
                    txt_wpm_wgt_mng_sch_nme: search,
                    cmd_search: 'Go',
                },
            });
            let res = [];
            $('div > div > div > div.det > a', doc).each(function(index) {
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
            $('div > div.wpm_pag.mng_det > ul > li > a', doc).each(function() {
                let url = $(this).attr('href');
                let chap = url.split('/')[4];
                res.push([chap, url]);
            });
            return res;
        },

        getInformationsFromCurrentPage: async function(doc, curUrl) {
            let mga = $('div.wpm_pag.mng_rdr > h1 > a', doc);
            return {
                name: mga.text().trim(),
                currentMangaURL: mga.attr('href'),
                currentChapterURL: curUrl,
            };
        },

        getListImages: async function(doc, curUrl) {
            let res = [];

            $('#image-container > center > img', doc).each(function() {
                res.push($(this).attr('src'));
            });

            return res;
        },

        getImageFromPageAndWrite: async function(urlImg, image) {
            $(image).attr('src', urlImg);
        },

        isCurrentPageAChapterPage: function(doc, curUrl) {
            return $('div.wpm_pag.mng_rdr > h1 > a', doc).length > 0;
        },
    });
}
