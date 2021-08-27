if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Comic Dom",
        mirrorIcon: "comic-dom.jpg",
        languages: "en",
        domains: ["comicdom.org"],
        home: "https://comicdom.org/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://comicdom.org/",
            chapter_list_ajax: true
        }
    })
}

