if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Gourmet Scans",
        mirrorIcon: "gourmet-scans.png",
        languages: "en",
        domains: ["gourmetscans.net", "gourmetsupremacy.com"],
        home: "https://gourmetsupremacy.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|project)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://gourmetsupremacy.com/",
            image_protection_plugin: true
        }
    })
}
