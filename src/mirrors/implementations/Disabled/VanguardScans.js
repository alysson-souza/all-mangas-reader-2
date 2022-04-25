if (typeof registerMangaObject === "function") {
    registerMangaObject({
        disabled: true,
        mirrorName: "Vanguard Scans",
        mirrorIcon: "vanguard.png",
        languages: "en",
        domains: ["vanguardbun.com"],
        home: "https://vanguardbun.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://vanguardbun.com/",
            search_json: true,
            chapter_list_ajax: true
        }
    })
}
