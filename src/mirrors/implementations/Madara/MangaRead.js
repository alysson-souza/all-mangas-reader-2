if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Read",
        mirrorIcon: "manga-read.png",
        languages: "en",
        domains: ["mangaread.org"],
        home: "https://www.mangaread.org/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.mangaread.org/"
        }
    })
}
