if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Immortal Updates",
        mirrorIcon: "immortalupdates.png",
        languages: "en",
        domains: ["immortalupdates.com"],
        home: "https://immortalupdates.com/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://immortalupdates.com/",
            chapter_list_ajax: true
        }
    })
}

