if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manhuaus",
        mirrorIcon: "manhuaus.com.png",
        languages: "en",
        domains: ["manhuaus.com"],
        home: "https://manhuaus.com/",
        chapter_url: /\/manga\/.+\/chapter\-.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manhuaus.com/",
            img_src: "src",
            chapter_list_ajax: true,
            secondary_img_src: "data-src"
        }
    })
}

