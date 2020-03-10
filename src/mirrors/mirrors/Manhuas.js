if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manhuas",
        mirrorIcon: "toonily.png",
        languages: "en",
        domains: ["manhuas.net"],
        home: "https://manhuas.net/",
        chapter_url: /\/manhua\/.*\-chapter\-.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manhuas.net/",
            img_src: "src",
            secondary_img_src: "data-src"
        }
    })
}

