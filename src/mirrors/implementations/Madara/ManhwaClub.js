if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "ManhwaClub",
        mirrorIcon: "manhwaclub.png",
        languages: "en",
        domains: ["manhwa.club"],
        home: "https://manhwa.club/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manhwa.club/",
            secondary_img_src: "data-src"
        }
    })
}