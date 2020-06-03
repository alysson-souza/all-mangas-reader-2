if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Hero Manhua",
        canListFullMangas: false,
        mirrorIcon: "heromanhua.png",
        domains: ["heromanhua.com"],
        home: "https://heromanhua.com",
        chapter_url: /^\/manga\/.*\/.*$/g,
        languages: "en",
        search_json: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://heromanhua.com/",
            img_src: "data-src",
            secondary_img_src: "src",
            overload: {
                getListChaps: async function(self, urlManga) {
                    let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
                    let mangaVar = amr.getVariable('manga', doc)
                    let doc2 = await amr.loadPage(mangaVar.ajax_url, { 
                        nocache: true, 
                        preventimages: true,
                        post: true,
                        data: {
                            action: "manga_get_chapters",
                            manga: mangaVar.manga_id
                        }
                    })
                    var res = []
                    var mangaName = $(self.options.search_a_sel, doc).text().trim()

                    $(self.options.chapters_a_sel, doc2).each(function (index) {
                        res.push([
                            $(this).text().replace(mangaName, "").trim(),
                            self.makeChapterUrl($(this).attr("href")) // add ?style=list to load chapter in long strip mode, remove it if it already there and add it again,
                        ])
                    })
                    res = res
                    return res
                }
            }
        }
    })
}