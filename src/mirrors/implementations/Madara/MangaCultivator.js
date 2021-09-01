if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Manga Cultivator',
        mirrorIcon: 'manga-cultivator.png',
        languages: 'en',
        domains: ['mangacultivator.com'],
        home: 'https://mangacultivator.com/',
        canListFullMangas: true,
        // chapter_url: /^\/manga\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: 'https://mangacultivator.com/',
            chapter_list_ajax: true
        },
    });
}
