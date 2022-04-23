if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Setsu Scans",
        mirrorIcon: "setsuscans.png",
        languages: "en",
        domains: ["setsuscans.com"],
        home: "https://setsuscans.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://setsuscans.com/",
            chapter_list_ajax: true,
            isekai_chapter_url: true,
            chapter_list_ajax_selctor_type: "html",
            chapter_list_ajax_selctor: "#manga-chapters-holder"
        }
    })
}
