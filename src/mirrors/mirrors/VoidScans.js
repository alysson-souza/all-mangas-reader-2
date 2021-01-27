if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Void Scans",
        mirrorIcon: "voidscans.webp",
        languages: "en",
        domains: ["voidscans.com"],
        home: "https://voidscans.com/",
        chapter_url: /^\/manga\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://voidscans.com/"
        }
    })
}