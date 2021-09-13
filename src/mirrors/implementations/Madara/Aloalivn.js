if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Aloalivn",
        mirrorIcon: "aloalivn.png",
        languages: "en",
        domains: ["aloalivn.com"],
        home: "https://aloalivn.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://aloalivn.com/",
            chapter_list_ajax: true
        }
    })
}

