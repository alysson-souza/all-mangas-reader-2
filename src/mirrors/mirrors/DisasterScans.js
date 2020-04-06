if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Disaster Scans",
        mirrorIcon: "disasterscans.png",
        languages: "en",
        domains: ["disasterscans.com"],
        home: "https://disasterscans.com/",
        chapter_url: /^\/manga\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "htts://disasterscans.com/",
            img_src: "data-src"
        }
    })
}

