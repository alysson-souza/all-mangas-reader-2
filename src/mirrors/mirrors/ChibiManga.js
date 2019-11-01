if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "ChibiManga",
        mirrorIcon: "chibimanga.png",
        languages: "en",
        domains: ["www.cmreader.info"],
        home: "http://www.cmreader.info/",
        chapter_url: /^\/manga\/.*\/.*$/g,

        abstract: "Madara",
        abstract_options: {
            search_url: "http://www.cmreader.info",
            search_json: false
        }
    })
}