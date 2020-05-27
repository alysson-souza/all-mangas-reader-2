if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "EarlyManga",
        mirrorIcon: "earlymanga.png",
        languages: "en",
        domains: ["earlymanga.net"],
        home: "https://earlymanga.net",
        chapter_url: /^\/manga\/.*\/.*$/g,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://earlymanga.net/",
            search_json: true,
            img_src: "data-src",
            secondary_img_src: "src",
            overload: {
                getListChaps: async function(self, urlManga) {
                    let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
                    let searchApiUrl = self.options.search_url + "wp-admin/admin-ajax.php"
                    let mangaVar = amr.getVariable('manga', doc)
                    let doc2 = await amr.loadPage(searchApiUrl, { 
                        nocache: true, 
                        preventimages: true,
                        post: true,
                        data: {
                            action: "manga_get_chapters",
                            manga: mangaVar.manga_id
                        }
                    })
                    var res = [];
                    var mangaName = $(self.options.search_a_sel, doc).text().trim();
                    $(self.options.chapters_a_sel, doc2).each(function (index) {
                        res[index] = [
                            $(this).text().replace(mangaName, "").trim(),
                            self.makeChapterUrl($(this).attr("href")) // add ?style=list to load chapter in long strip mode, remove it if it already there and add it again,
                        ];
                    });
                    res = res;
                    return res;

                }
            }
        }
    })
}