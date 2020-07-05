if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "EarlyManga",
        mirrorIcon: "earlymanga.png",
        languages: "en",
        domains: ["earlymanga.net", "earlymanga.me"],
        home: "https://earlymanga.me",
        chapter_url: /^\/manga\/.*\/.*$/g,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://earlymanga.me/",
            search_json: true,
            img_src: "data-src",
            secondary_img_src: "src",
            chapter_list_ajax: true
        }
    })
}