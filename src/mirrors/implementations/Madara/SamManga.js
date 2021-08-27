if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Sam Manga",
        mirrorIcon: "sam-manga.png",
        languages: "en",
        domains: ["sammanga.com"],
        home: "https://sammanga.com/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://sammanga.com/",
        }
    })
}

