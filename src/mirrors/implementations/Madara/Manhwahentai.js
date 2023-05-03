if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "ManhwaHentai",
        mirrorIcon: "manhwahentai.png",
        languages: "en",
        domains: ["manhwahentai.me"],
        home: "https://manhwahentai.me/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manhwahentai.me/",
            img_src: "src",
			secondary_img_src: "data-src",
			chapter_list_ajax: true,
            isekai_chapter_url: true
        }
    })
}
