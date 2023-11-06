if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Sy",
        mirrorIcon: "mangasy.png",
        languages: "en",
        domains: ["mangasy.com"],
        home: "https://www.mangasy.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.mangasy.com/",
            chapter_list_ajax: true
        }
    })
}
