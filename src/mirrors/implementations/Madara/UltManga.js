if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Ult Manga",
        mirrorIcon: "ultmanga.jpg",
        languages: "en",
        domains: ["ultmanga.com"],
        home: "https://ultmanga.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://ultmanga.com/",
            img_src: "data-src"
            // chapter_list_ajax: true,
        }
    })
}
