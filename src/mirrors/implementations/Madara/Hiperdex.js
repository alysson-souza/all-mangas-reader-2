if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Hiperdex",
        mirrorIcon: "hiperdex.png",
        languages: "en",
        domains: ["hiperdex.com"],
        home: "https://hiperdex.com/",
        // chapter_url: /^\/manga\/.*\/.+$/g,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://hiperdex.com/",
            search_json: true,
            chapter_list_ajax: true
        }
    })
}