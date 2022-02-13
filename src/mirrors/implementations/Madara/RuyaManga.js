if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Ruya Manga",
        mirrorIcon: "ruya-manga.png",
        languages: "en",
        domains: ["en.ruyamanga.com"],
        home: "https://en.ruyamanga.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://en.ruyamanga.com/",
        }
    })
}

