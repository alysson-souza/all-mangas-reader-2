if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Toonily",
        mirrorIcon: "toonily.png",
        languages: "en",
        domains: ["toonily.com"],
        home: "https://toonily.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://toonily.com/",
            img_src: "data-src",
            chapter_list_ajax: false
        }
    })
}
