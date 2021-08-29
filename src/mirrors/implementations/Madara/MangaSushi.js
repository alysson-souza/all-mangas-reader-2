if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga Sushi",
        mirrorIcon: "mangasushi.png",
        languages: "en",
        domains: ["mangasushi.net"],
        home: "https://mangasushi.net/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangasushi.net/",
            secondary_img_src: "data-src",
            chapter_list_ajax: true,
            isekai_chapter_url: true
        }
    })
}