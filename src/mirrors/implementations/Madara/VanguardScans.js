if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Vanguard Scans",
        mirrorIcon: "vanguard.png",
        languages: "en",
        domains: ["vanguardbun.com"],
        home: "https://vanguardbun.com/",
        // chapter_url: /^\/manga\/.*\/.+$/g,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://vanguardbun.com/",
            search_json: true,
            chapter_list_ajax: true
        }
    })
}