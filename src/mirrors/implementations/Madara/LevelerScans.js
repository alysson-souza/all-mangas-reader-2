if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Leveler Scans",
        mirrorIcon: "leveler-scans.png",
        languages: "en",
        domains: ["levelerscans.xyz"],
        home: "https://levelerscans.xyz/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://levelerscans.xyz/",
            chapter_list_ajax: true
        }
    })
}

