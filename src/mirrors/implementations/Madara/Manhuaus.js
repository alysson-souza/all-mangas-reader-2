if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manhuaus",
        mirrorIcon: "manhuaus.png",
        languages: "en",
        domains: ["manhuaus.com"],
        home: "https://manhuaus.com/",
        chapter_url: /\/manga\/.+\/chapter\-.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manhuaus.com/",
            img_src: "src",
            chapter_list_ajax: true,
            isekai_chapter_url: true,
            secondary_img_src: "data-src"
        }
    })
}
