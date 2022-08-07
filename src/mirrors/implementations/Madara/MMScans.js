if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "MM Scans",
        mirrorIcon: "mmscans.png",
        languages: "en",
        domains: ["mm-scans.com", "mm-scans.org"],
        home: "https://mm-scans.org/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mm-scans.org/",
            chapter_list_ajax: true,
            isekai_chapter_url: true,
            chapters_a_sel: "li.chapter-li > a"
        }
    })
}
