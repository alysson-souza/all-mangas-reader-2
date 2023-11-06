if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "ChibiManga",
        mirrorIcon: "chibimanga.png",
        languages: "en",
        domains: ["cmreader.info"],
        home: "https://www.cmreader.info/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.cmreader.info/",
            search_json: false,
            chapter_list_ajax: true
        }
    })
}
