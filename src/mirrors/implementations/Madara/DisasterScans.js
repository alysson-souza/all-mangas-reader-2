if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Disaster Scans",
        mirrorIcon: "disasterscans.png",
        languages: "en",
        domains: ["disasterscans.com"],
        home: "https://disasterscans.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://disasterscans.com/",
            img_src: "data-src",
            chapter_list_ajax: true,
            isekai_chapter_url: true
        }
    })
}
