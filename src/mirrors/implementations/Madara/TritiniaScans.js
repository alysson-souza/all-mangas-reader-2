if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Tritinia Scans",
        mirrorIcon: "tritiniascans.png",
        languages: "en",
        domains: ["tritinia.com"],
        home: "https://tritinia.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://tritinia.com/",
            chapter_list_ajax: true,
            isekai_chapter_url: true
        }
    })
}
