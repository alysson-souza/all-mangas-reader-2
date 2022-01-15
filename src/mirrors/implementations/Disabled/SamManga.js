if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        disabled: true,
        mirrorName: "Sam Manga",
        mirrorIcon: "sam-manga.png",
        languages: "en",
        domains: ["sammanga.com"],
        home: "https://sammanga.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://sammanga.com/",
        }
    })
}

