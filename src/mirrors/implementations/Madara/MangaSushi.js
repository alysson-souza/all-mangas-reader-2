if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Sushi",
        mirrorIcon: "mangasushi.png",
        languages: "en",
        domains: ["mangasushi.net", "mangasushi.org"],
        home: "https://mangasushi.org/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangasushi.org/",
            secondary_img_src: "data-src",
            chapter_list_ajax: true,
            isekai_chapter_url: true
        }
    })
}
