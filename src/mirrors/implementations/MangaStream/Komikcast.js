if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Komicast",
        canListFullMangas: false,
        mirrorIcon: "komikcast.png",
        domains: ["komikcast.com"],
        home: "https://komikcast.com/",
        chapter_url: /^\/chapter\/.+$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://komikcast.com/",
            search_json: false
        },      
    })
}