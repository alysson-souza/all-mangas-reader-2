if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manganelo",
        mirrorIcon: "manganelo.png",
        languages: "en",
        domains: [
            "manganato.com",
            "chap.manganato.com",
            "m.manganato.com",
            "readmanganato.com",
            "m.manganelo.com",
            "chap.manganelo.com",
            "chapmanganato.com",
            "chapmanganelo.com"
        ],
        home: "https://manganato.com/",
        chapter_url: /^\/manga-.*\/chapter-\d+.*$/g,

        abstract: "MangakakalotAbs",
        abstract_options: {
            base_url: "https://manganato.com/",
            search_url: "search/story/",
            series_list_selector: ".search-story-item a.item-title",
            chapter_list_selector: ".row-content-chapter a",
            chapter_information_selector:
                '.panel-breadcrumb:first a[href*="/manga/"]:first, .panel-breadcrumb:first a[href*="/manga-"]:first',
            images_selector: ".container-chapter-reader img"
        }
    })
}
