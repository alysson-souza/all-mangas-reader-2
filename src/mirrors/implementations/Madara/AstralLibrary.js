if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Astral Library",
        mirrorIcon: "astrallibrary.png",
        languages: "en",
        domains: ["astrallibrary.net"],
        home: "https://astrallibrary.net/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: true,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://astrallibrary.net/",
            chapter_list_ajax: true
        }
    })
}
