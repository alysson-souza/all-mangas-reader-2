if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Martial Scans",
        mirrorIcon: "martialscans.png",
        languages: "en",
        domains: ["martialscans.com"],
        home: "https://martialscans.com/",
        chapter_url: /^\/manhua\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://martialscans.com/",
            img_src: "data-src",
            chapter_list_ajax: true,
        }
    })
}

