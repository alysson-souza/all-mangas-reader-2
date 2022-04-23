if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Imperfect Comics",
        mirrorIcon: "imperfect-comics.png",
        languages: "en",
        domains: ["imperfectcomic.com"],
        home: "https://imperfectcomic.com/",

        chapter_url: /\/.*?chapter-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangaStream_1_1_4Abs",
        abstract_options: {
            base_url: "https://imperfectcomic.com/"
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
