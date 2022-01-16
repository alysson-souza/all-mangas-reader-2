if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga Dods",
        mirrorIcon: "mangadods.png",
        languages: "en",
        domains: ["www.mangadods.com"],
        home: "https://www.mangadods.com/",
        chapter_url: /\/manga\/.*\/(ch-)?\d/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.mangadods.com/",
            img_src: "src",
            chapter_list_ajax: false,
            secondary_img_src: "data-src",
            chapters_a_sel: "li.wp-manga-chapter a",
        }
    })
}

