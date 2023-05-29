if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Clash",
        mirrorIcon: "manga-clash.png",
        languages: "en",
        domains: ["mangaclash.com"],
        home: "https://mangaclash.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|devmax)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangaclash.com/"
            // chapters_a_sel: "li.wp-manga-chapter .li__text a",
            // chapter_list_ajax: true,
            // isekai_chapter_url: true,
            // image_protection_plugin: true
        }
    })
}
