if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "ReadManga",
        mirrorIcon: "readmanga.png",
        languages: "ru",
        domains: ["readmanga.live", "readmanga.io"],
        home: "https://readmanga.live",
        canListFullMangas: false,
        chapter_url: /^\/.*\/vol.*\/[0-9]+.*$/g,
        abstract: "ReadMangaAbs",
        abstract_options: {
            base_url: "https://readmanga.live"
        }
    })
}
