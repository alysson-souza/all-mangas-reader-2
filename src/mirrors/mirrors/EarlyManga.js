if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "EarlyManga",
        mirrorIcon: "earlymanga.png",
        languages: "en",
        domains: ["earlymanga.net"],
        home: "https://earlymanga.net",
        chapter_url: /^\/manga\/.*\/.*$/g,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://earlymanga.net/",
            search_json: true,
            img_src: "data-src",
            secondary_img_src: "src",
            chapter_list_ajax: true
        }
    })
}