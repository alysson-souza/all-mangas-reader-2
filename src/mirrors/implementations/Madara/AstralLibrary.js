if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Astral Library",
        mirrorIcon: "astrallibrary.png",
        languages: "en",
        domains: ["www.astrallibrary.net"],
        home: "https://www.astrallibrary.net/",
        chapter_url: /^\/manga\/.+\/.+$/g,
        canListFullMangas: true,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://astrallibrary.net/",
            chapter_list_ajax: true
        }
    })
}

