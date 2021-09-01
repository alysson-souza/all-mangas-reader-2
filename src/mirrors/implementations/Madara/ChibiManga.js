if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "ChibiManga",
        mirrorIcon: "chibimanga.png",
        languages: "en",
        domains: ["www.cmreader.info"],
        home: "https://www.cmreader.info/",
        // chapter_url: /^\/manga\/.*\/.+$/g,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.cmreader.info/",
            search_json: false,
            chapter_list_ajax: true
        }
    })
}