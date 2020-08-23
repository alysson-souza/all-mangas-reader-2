if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Night Comic",
        mirrorIcon: "nightcomic.png",
        languages: "en",
        domains: ["nightcomic.com"],
        home: "https://nightcomic.com/",
        chapter_url: /^\/manga\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://nightcomic.com/",
            img_src: "data-src",
            chapter_list_ajax: true,
        }
    })
}

