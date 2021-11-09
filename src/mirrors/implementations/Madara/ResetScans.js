if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Reset Scans",
        mirrorIcon: "reset-scans.png",
        languages: "en",
        domains: ["reset-scans.com"],
        home: "https://reset-scans.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://reset-scans.com/",
            chapters_a_sel: "li.wp-manga-chapter a",
            // chapter_list_ajax: true,
            // isekai_chapter_url: true
        }
    })
}

