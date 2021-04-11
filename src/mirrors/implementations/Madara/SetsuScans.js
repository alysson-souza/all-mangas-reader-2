if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Setsu Scans",
        mirrorIcon: "setsuscans.png",
        languages: "en",
        domains: ["setsuscans.com"],
        home: "https://setsuscans.com/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://setsuscans.com/",
            chapter_list_ajax: true
        }
    })
}

