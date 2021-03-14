if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'ManhuaPlus',
        mirrorIcon: 'manhuaplus.png',
        languages: "en",
        domains: ['manhuaplus.com'],
        home: 'https://manhuaplus.com/',
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manhuaplus.com/",
            search_a_sel: "div.post-title > h3 > a",
            chapter_list_ajax: true,
        }
    })
}
