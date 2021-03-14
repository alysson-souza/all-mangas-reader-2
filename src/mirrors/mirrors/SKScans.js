if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'SK Scans',
        mirrorIcon: 'skscans.png',
        languages: 'en',
        domains: ['skscans.com'],
        home: 'https://skscans.com/home',
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.+$/g,
        abstract: 'GenkanAbs',
        abstract_options: {
            base_url: 'https://skscans.com/',
        },
    });
}
