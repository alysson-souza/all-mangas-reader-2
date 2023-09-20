if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Mangalek",
        mirrorIcon: "manga-lek.png",
        languages: "ar",
        domains: ["mangalek.com"],
        home: "https://mangalek.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangalek.com/"
        }
    })
}
