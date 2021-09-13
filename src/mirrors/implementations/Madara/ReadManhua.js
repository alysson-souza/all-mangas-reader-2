if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Read Manhua",
        mirrorIcon: "readmanhua.png",
        languages: "en",
        domains: ["readmanhua.net"],
        home: "https://readmanhua.net/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: true,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://readmanhua.net/",
            chapter_list_ajax: true
        }
    })
}