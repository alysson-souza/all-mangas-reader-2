// Broken
if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "ZeroScans",
        mirrorIcon: "zeroscans.png",
        languages: "en",
        domains: ["zeroscans.com"],
        home: "https://zeroscans.com/",
        chapter_url: /^\/(manga|comics)\/.*\/.*$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://zeroscans.com/",
            page_container_sel: "#pages-container",
            img_sel: "#pages-container img"
        }
    })
}