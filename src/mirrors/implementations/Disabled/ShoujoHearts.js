if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Shoujo Hearts",
        mirrorIcon: "shoujohearts.png",
        languages: "en",
        domains: ["shoujohearts.com"],
        home: "https://shoujohearts.com/reader",
        chapter_url: /^\/reader\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        disabled: true,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://shoujohearts.com/reader/",
            path_length: 3
            // chapter_list_ajax: true
        }
    })
}
