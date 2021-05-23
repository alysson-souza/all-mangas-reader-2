if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Comic Kiba',
        mirrorIcon: 'comickiba.png',
        languages: 'en',
        domains: ['comickiba.com'],
        home: 'https://comickiba.com/',
        canListFullMangas: true,
        chapter_url: /^\/manga\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: 'https://comickiba.com/',
            chapter_list_ajax: true
        },
    });
}
