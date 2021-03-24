if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "MM Scans",
        mirrorIcon: "mmscans.png",
        languages: "en",
        domains: ["mm-scans.com"],
        home: "https://mm-scans.com/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mm-scans.com/",
            chapter_list_ajax: true
        }
    })
}

