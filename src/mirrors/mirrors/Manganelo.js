if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Manganelo",
        mirrorIcon: "manganelo.png",
        languages: "en",
        domains: ["manganelo.com", "chap.manganelo.com"],
        home: "https://manganelo.com/",
        chapter_url: /^\/chapter\/.*\/.*$/g,

        abstract: "MangakakalotAbs",
        abstract_options: {
            base_url: "https://manganelo.com/",
            series_list_selector: '.search-story-item a.item-title',
            chapter_list_selector: '.row-content-chapter a',
            chapter_information_selector: '.panel-breadcrumb:first a[href*="/manga/"]:first, .panel-breadcrumb:first a[href*="/manga-"]:first',
            images_selector: '.container-chapter-reader img'
        }
        
    });
}