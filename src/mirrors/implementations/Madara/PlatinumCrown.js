if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Platinum Crown",
        mirrorIcon: "platinum-crown.png",
        languages: "en",
        domains: ["platinumscans.com"],
        home: "https://platinumscans.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://platinumscans.com/",
            chapter_list_ajax: true
            // isekai_chapter_url: true
        }
    })
}
