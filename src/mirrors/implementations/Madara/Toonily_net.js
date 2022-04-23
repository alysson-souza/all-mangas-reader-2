if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Toonily.Net",
        mirrorIcon: "toonily_net.png",
        languages: "en",
        domains: ["toonily.net"],
        home: "https://toonily.net",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://toonily.net/",
            chapter_list_ajax: false
        }
    })
}
