if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manhwax",
        mirrorIcon: "manhwax.png",
        languages: "en",
        domains: ["manhwax.com"],
        home: "https://manhwax.com/",

        chapter_url: /\/.*?chapter-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangaStream_1_1_4Abs",
        abstract_options: {
            base_url: "https://manhwax.com/"
        }

        /*chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://imperfectcomic.com/",
            // chapter_list_ajax: true
        }*/
    })
}
