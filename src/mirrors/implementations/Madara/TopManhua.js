if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Top Manhua",
        mirrorIcon: "topmanhua.png",
        languages: "en",
        domains: ["www.topmanhua.com"],
        home: "https://www.topmanhua.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.topmanhua.com/"
        }
    })
}