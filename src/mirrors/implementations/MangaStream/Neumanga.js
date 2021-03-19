if (typeof registerMangaObject === 'function') {
    
    registerMangaObject({
        mirrorName: "Neumanga",
        canListFullMangas: false,
        mirrorIcon: "neumanga.png",
        domains: ["neumanga.tv"],
        home: "https://neumanga.tv/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://neumanga.tv/advanced_search",
            search_option: "&name_search_mode=contain",
            search_a_sel: "h2 > a[href*='/manga/']",
            search_field: "name_search_query",
            chapter_url_suffix:"/_/1",
            chapters_a_sel: "#scans > div > div.item-content > a",
            manga_title_attr: false,
            manga_url_sel: "#main > div.readarea > article > div.head > center > span > a",
            page_container_sel: "div[itemprop='mainContentOfPage']",
            img_sel: "img.imagechap",
            img_src: "data-src",
            search_json: false
            
        },      
    })
}