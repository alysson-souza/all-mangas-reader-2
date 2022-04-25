if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Mixed Manga",
        mirrorIcon: "mixed-manga.png",
        languages: "en",
        domains: ["mixedmanga.com"],
        home: "https://mixedmanga.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mixedmanga.com/",
            img_src: "data-lazy-src"
        }
    })
}
