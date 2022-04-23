if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga TX",
        mirrorIcon: "mangatx.png",
        languages: "en",
        domains: ["mangatx.com"],
        home: "https://mangatx.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangatx.com/",
            img_src: "data-src",
            chapter_list_ajax: true
        }
    })
}
