if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Yomanga",
        mirrorIcon: "yomanga.png",
        languages: "en",
        domains: ["yomanga.info"],
        home: "https://yomanga.info/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        disabled: true,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://yomanga.info/"
        }
    })
}

