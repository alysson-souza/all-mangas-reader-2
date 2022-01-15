if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "247 Manga",
        mirrorIcon: "247-manga.png",
        languages: "en",
        domains: ["247manga.com"],
        home: "https://247manga.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://247manga.com/",
        }
    })
}

