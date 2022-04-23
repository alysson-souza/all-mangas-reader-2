if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Random Translations",
        mirrorIcon: "randomtranslations.png",
        languages: "en",
        domains: ["randomtranslations.com"],
        home: "https://randomtranslations.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://randomtranslations.com/",
            img_src: "data-src",
            chapter_list_ajax: true
        }
    })
}
