if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "FunManga",
        canListFullMangas: true,
        mirrorIcon: "funmanga.png",
        languages: "en",
        domains: ["www.funmanga.com"],
        home: "http://www.funmanga.com",
        chapter_url: /^\/.*\/[0-9]+\/.+$/g,

        abstract: "FunMangaAbs",
        abstract_options: {
            search_url: "http://www.funmanga.com/service/advanced_search",
            search_data_field: "manga-name",
            search_a_sel: ".manga-title a",
            search_default_data: {
                type: "all",
                status: "both",
                "author-name": "",
                "artist-name": ""
            },
            sendDataAsText: true,
            chapters_a_sel: "ul.chapter-list li > a",
            page_container_sel: "body > .amr-container",
            doBefore: (doc, url) => {
                $("body > .chapter-read", doc).prev().remove()
                $("body > .chapter-read", doc).next().remove()
                $("body > .chapter-read", doc).before($("<div class='amr-container'></div>"))
                $("body > .chapter-read", doc).remove()
            }
        }
    })
}