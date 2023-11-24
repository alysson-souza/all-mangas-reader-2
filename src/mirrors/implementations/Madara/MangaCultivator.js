if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Cultivator",
        mirrorIcon: "manga-cultivator.png",
        languages: "en",
        domains: ["mangacultivator.com", "mangacult.org"],
        home: "https://mangacult.org/home-hi/",
        canListFullMangas: true,
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangacult.org/",
            // chapter_list_ajax: true,
            // isekai_chapter_url: true,
            image_protection_plugin: true
        }
    })
}
