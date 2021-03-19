if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Leviatan Scans',
        mirrorIcon: 'leviatan.png',
        languages: 'en',
        domains: ['leviatanscans.com'],
        home: 'https://leviatanscans.com/',
        canListFullMangas: true,
        chapter_url: /^\/manga\/.*\/.+$/g,

        abstract: 'Madara',
        abstract_options: {
            search_url: 'https://leviatanscans.com/',
            chapter_list_ajax: true
        },
    });
}
