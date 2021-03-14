if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "MangazukiMe",
        mirrorIcon: "mangazuki.png",
        languages: "en",
        domains: ["mangazuki.me"],
        home: "https://mangazuki.me",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://mangazuki.me/",
            page_container_sel: "div.read-container",
            img_sel: "div.read-container img"

        }
    })
}

