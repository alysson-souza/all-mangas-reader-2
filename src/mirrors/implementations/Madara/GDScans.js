if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "GD Scans",
        mirrorIcon: "gd-scans.png",
        languages: "en",
        domains: ["gdstmp.site"],
        home: "https://gdstmp.site/",
        canListFullMangas: true,
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://gdstmp.site/",
            chapter_list_ajax: true
        }
    })
}
