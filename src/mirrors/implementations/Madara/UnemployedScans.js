if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Unemployed Scans',
        mirrorIcon: 'unemployed-scans.jpg',
        languages: 'en',
        domains: ['unemployedscans.com'],
        home: 'https://unemployedscans.com/',
        canListFullMangas: false,
        chapter_url: /^\/manga\/.*\/.+$/g,
        abstract: 'Madara',
        abstract_options: {
            search_url: 'https://unemployedscans.com/',
            chapter_list_ajax: true,
        },
    });
}