if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Aqua Manga",
        mirrorIcon: "aqua-manga.png",
        languages: "en",
        domains: ["aquamanga.com", "aquascans.com"],
        home: "https://aquascans.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://aquascans.com/",
            add_list_to_chapter_url: false
        }
    })
}
