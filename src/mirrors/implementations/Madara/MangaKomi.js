if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Komi",
        mirrorIcon: "mangakomi.png",
        languages: "en",
        domains: ["mangakomi.com"],
        home: "https://mangakomi.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangakomi.com/",
            img_src: "src",
            secondary_img_src: "data-src",
            chapter_list_ajax: true
        }
    })
}
