if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Komicast",
        canListFullMangas: false,
        mirrorIcon: "komikcast.png",
        domains: ["komikcast.com"],
        home: "https://komikcast.com/",
        chapter_url: /^\/chapter\/.+$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://komikcast.com/",
            search_json: false,
            search_a_sel: "div.list-update_item > a",
            chapters_a_sel: 'div.komik_info-chapters a.chapter-link-item',
            page_container_sel: '.main-reading-area',
            img_sel: '.main-reading-area img',
        },
    })
}
