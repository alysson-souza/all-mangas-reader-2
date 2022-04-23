if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manytoon",
        mirrorIcon: "manytoon.png",
        languages: "en",
        domains: ["manytoon.com"],
        home: "https://manytoon.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manytoon.com/",
            img_src: "data-src",
            chapter_list_ajax: true,
            isekai_chapter_url: true
        }
    })
}
