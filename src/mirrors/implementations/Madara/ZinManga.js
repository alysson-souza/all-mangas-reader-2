if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Zin Manga",
        mirrorIcon: "zin-manga.webp",
        languages: "en",
        domains: ["zinmanga.com"],
        home: "https://zinmanga.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://zinmanga.com/"
        }
    })
}
