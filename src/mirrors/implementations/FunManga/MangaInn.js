if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "MangaInn",
        canListFullMangas: true,
        mirrorIcon: "mangainn.png",
        languages: "en",
        domains: ["www.mangainn.net"],
        home: "http://www.mangainn.net",
        chapter_url: /^\/.*\/[0-9]+\.?[0-9]*\/.+$/g,

        abstract: "FunMangaAbs",
        abstract_options: {
            search_url: "http://www.mangainn.net/service/advanced_search",
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
                let cont = $("body > .container", doc)
                cont.empty().removeClass("container").addClass("amr-container")
            }
        }
    })
}
