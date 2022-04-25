if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "ManhuaFast",
        mirrorIcon: "manhuafast.png",
        languages: "en",
        domains: ["manhuafast.com"],
        home: "https://manhuafast.com/",
        chapter_url: /\/manga\/.+\/chapter-.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manhuafast.com/",
            img_src: "src",
            chapter_list_ajax: true,
            isekai_chapter_url: true
            // secondary_img_src: "data-full-url"
        }
    })
}
