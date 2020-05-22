if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Martial Scans",
        mirrorIcon: "martialscans.png",
        languages: "en",
        domains: ["martialscans.com"],
        home: "https://martialscans.com/",
        chapter_url: /^\/manhua\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://martialscans.com/",
            img_src: "data-src",
            overload: {
                getListChaps: async function(self, urlManga) {
                    console.log(self)
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

