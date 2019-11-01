if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "IsekaiScans",
        mirrorIcon: "isekaiscans.png",
        languages: "en",
        domains: ["isekaiscan.com"],
        home: "http://isekaiscan.com/",
        chapter_url: /^\/manga\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "http://isekaiscan.com/",
            img_src: "data-src"
        }
    })
}

