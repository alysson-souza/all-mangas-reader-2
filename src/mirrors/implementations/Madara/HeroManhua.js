if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Hero Manhua",
        canListFullMangas: false,
        mirrorIcon: "heromanhua.png",
        domains: ["heromanhua.com"],
        home: "https://heromanhua.com",
        chapter_url: /^\/manga\/.*\/.+$/g,
        languages: "en",
        search_json: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://heromanhua.com/",
            img_src: "data-src",
            secondary_img_src: "src",
            chapter_list_ajax: true
        }
    })
}