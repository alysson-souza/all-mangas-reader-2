if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga Sy",
        mirrorIcon: "mangasy.png",
        languages: "en",
        domains: ["www.mangasy.com"],
        home: "https://www.mangasy.com/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.mangasy.com/",
            chapter_list_ajax: true
        }
    })
}

