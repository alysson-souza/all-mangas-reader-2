if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "ZeroScans",
        mirrorIcon: "zeroscans.png",
        languages: "en",
        domains: ["zeroscans.com"],
        home: "https://zeroscans.com/",
        chapter_url: /^\/manga\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://zeroscans.com/",
            page_container_sel: "div.read-container",
            img_sel: "div.read-container img"
        }
    })
}

