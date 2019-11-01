if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "MangazukiInfo",
        mirrorIcon: "mangazuki.png",
        languages: "en",
        domains: ["mangazuki.info"],
        home: "https://mangazuki.info/",
        // chapter_url: /^\/manga\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangazuki.info/",
            page_container_sel: "div.read-container",
            img_sel: "div.read-container img"

        }
    })
}

