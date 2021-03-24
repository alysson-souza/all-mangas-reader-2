if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Method Scans',
        mirrorIcon: 'methodscans.png',
        languages: 'en',
        domains: ['methodscans.com'],
        home: 'https://methodscans.com/home',
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.+$/g,
        abstract: 'GenkanAbs',
        abstract_options: {
            base_url: 'https://methodscans.com/',
        },
    });
}
