if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manytoon",
        mirrorIcon: "manytoon.png",
        languages: "en",
        domains: ["manytoon.com"],
        home: "https://manytoon.com/",
        // chapter_url: /^\/(manga|comic)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manytoon.com/",
            img_src: "src"
        }
    })
}

