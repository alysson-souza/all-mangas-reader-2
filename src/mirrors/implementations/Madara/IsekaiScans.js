if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "IsekaiScans",
        mirrorIcon: "isekaiscans.png",
        languages: "en",
        domains: ["isekaiscan.com"],
        home: "https://isekaiscan.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://isekaiscan.com/",
            img_src: "data-src",
            chapter_list_ajax: true,
            isekai_chapter_url: true
        }
    })
}

