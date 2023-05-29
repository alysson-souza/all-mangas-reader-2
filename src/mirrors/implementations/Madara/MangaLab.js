if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Lab",
        mirrorIcon: "manga-lab.png",
        languages: "en",
        domains: ["themangalab.com"],
        home: "https://themangalab.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://themangalab.com/",
            chapter_list_ajax: true,
            isekai_chapter_url: true
        }
    })
}
