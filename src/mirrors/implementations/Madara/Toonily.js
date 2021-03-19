if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Toonily",
        mirrorIcon: "toonily.png",
        languages: "en",
        domains: ["toonily.com"],
        home: "https://toonily.com/",
        chapter_url: /^\/webtoon\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://toonily.com/",
            img_src: "src",
            secondary_img_src: "data-src"
        }
    })
}

