if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Imperfect Comics",
        mirrorIcon: "imperfect-comics.png",
        languages: "en",
        domains: ["imperfectcomic.com"],
        home: "https://imperfectcomic.com/",
        chapter_url: /^\/manhwa\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://imperfectcomic.com/",
            chapter_list_ajax: true
        }
    })
}

