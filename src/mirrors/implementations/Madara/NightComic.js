if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Night Comic",
        mirrorIcon: "nightcomic.png",
        languages: "en",
        domains: ["www.nightcomic.com"],
        home: "https://www.nightcomic.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.nightcomic.com/",
            img_src: "data-src",
            chapter_list_ajax: true
        }
    })
}
