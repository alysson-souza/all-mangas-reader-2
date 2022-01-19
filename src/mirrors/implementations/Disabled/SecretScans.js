if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        disabled: true,
        mirrorName: 'Secret Scans',
        mirrorIcon: 'secretscans.png',
        languages: 'en',
        domains: ['secretscans.co'],
        home: 'https://secretscans.co/',
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.+$/g,
        abstract: 'GenkanAbs',
        abstract_options: {
            base_url: 'https://secretscans.co/',
        },
    });
}
