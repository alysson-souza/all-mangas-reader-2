if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "S2 Manga",
        mirrorIcon: "s2-manga.png",
        languages: "en",
        domains: ["s2manga.com"],
        home: "https://s2manga.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://s2manga.com/"
        }
    })
}
