if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Lynx Scans',
        mirrorIcon: 'lynxscans.png',
        languages: 'en',
        domains: ['lynxscans.com'],
        home: 'https://lynxscans.com/home',
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.+$/g,
        abstract: 'GenkanAbs',
        abstract_options: {
            base_url: 'https://lynxscans.com/',
        },
    });
}
