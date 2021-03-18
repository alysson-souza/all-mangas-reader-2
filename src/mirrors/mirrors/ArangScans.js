if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Arang Scans',
        mirrorIcon: 'arangscans.png',
        languages: 'en',
        domains: ['arangscans.com'],
        home: 'https://arangscans.com/',
        canListFullMangas: true,
        chapter_url: /^\/manga\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: 'https://arangscans.com/',
            chapter_list_ajax: true
        },
    });
}
