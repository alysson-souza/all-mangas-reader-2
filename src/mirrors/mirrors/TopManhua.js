if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Top Manhua",
        mirrorIcon: "topmanhua.png",
        languages: "en",
        domains: ["topmanhua.com"],
        home: "https://topmanhua.com/",
        chapter_url: /^\/manhua\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://topmanhua.com/"
        }
    })
}