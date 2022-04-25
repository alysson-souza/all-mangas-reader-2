if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Bob",
        mirrorIcon: "mangabob.png",
        languages: "en",
        domains: ["mangabob.com"],
        home: "https://mangabob.com/",
        canListFullMangas: true,
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangabob.com/",
            chapter_list_ajax: true
        }
    })
}
