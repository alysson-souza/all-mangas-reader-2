if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "MangaLEL",
        mirrorIcon: "mangalel.png",
        languages: "fr",
        domains: ["www.manga-lel.com"],
        home: "https://www.manga-lel.com/",
        chapter_url: /\/manga\/.*\/.+/g,
        
        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "https://www.manga-lel.com"
        }
    })
}