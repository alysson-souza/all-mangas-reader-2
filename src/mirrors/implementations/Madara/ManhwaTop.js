if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manhwa Top",
        mirrorIcon: "manhwa-top.png",
        languages: "en",
        domains: ["manhwatop.com"],
        home: "https://manhwatop.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manhwatop.com/",
            chapter_list_ajax: true,
            img_src: "data-src"
        }
    })
}
