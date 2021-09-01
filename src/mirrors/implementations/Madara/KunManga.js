if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Kun Manga",
        mirrorIcon: "kun-manga.png",
        languages: "en",
        domains: ["kunmanga.com"],
        home: "https://kunmanga.com/",
        // chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://kunmanga.com/",
        }
    })
}

