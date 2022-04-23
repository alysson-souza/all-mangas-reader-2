if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Unemployed Scans",
        mirrorIcon: "unemployed-scans.jpg",
        languages: "en",
        domains: ["unemployedscans.com"],
        home: "https://unemployedscans.com/",
        canListFullMangas: false,
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://unemployedscans.com/",
            chapter_list_ajax: true
        }
    })
}
