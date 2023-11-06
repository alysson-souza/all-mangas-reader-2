if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Shadow Trad",
        mirrorIcon: "shadow-trad.png",
        languages: "fr",
        domains: ["shadowtrad.net"],
        home: "https://shadowtrad.net/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://shadowtrad.net/",
            chapter_list_ajax: true,
            isekai_chapter_url: true
        }
    })
}
