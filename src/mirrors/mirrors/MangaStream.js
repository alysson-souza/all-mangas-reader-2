if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "MangaStream",
        mirrorIcon: "mangastream.png",
        languages: "en",
        domains: ["www.mangastream.cc"],
        home: "https://www.mangastream.cc/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.mangastream.cc/"
        }
    })
}