if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Sawamics",
        mirrorIcon: "sawamics.png",
        languages: "en",
        domains: ["sawamics.com"],
        home: "https://sawamics.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://sawamics.com/",
            chapter_list_ajax: false
        }
    })
}

