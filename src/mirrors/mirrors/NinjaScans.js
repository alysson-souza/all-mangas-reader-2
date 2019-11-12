if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "NinjaScans",
        mirrorIcon: "ninjascans.png",
        languages: "en",
        domains: ["ninjascans.com"],
        home: "https://ninjascans.com/",
        chapter_url: /^\/(manga|manhua)\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://ninjascans.com/",
            page_container_sel: "div.fuck-off-container",
            img_sel: "div.fuck-off img"
        }
    })
}