if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Komikgo",
        canListFullMangas: false,
        mirrorIcon: "komikgo.png",
        domains: ["komikgo.com"],
        home: "https://komikgo.com/",
        chapter_url: /^\/manga\/.*\/.*$/g,
        languages: "id",
        abstract: "Madara",
        abstract_options: {
            search_url: "https://komikgo.com/",
            img_src: "data-src",
        },
    })
}