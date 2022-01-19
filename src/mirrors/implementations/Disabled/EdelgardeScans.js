if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        disabled: true,
        mirrorName: 'Edelgarde Scans',
        mirrorIcon: 'edelgardescans.png',
        languages: 'en',
        domains: ['edelgardescans.com'],
        home: 'https://edelgardescans.com/home',
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.+$/g,
        abstract: 'GenkanAbs',
        abstract_options: {
            base_url: 'https://edelgardescans.com/',
        },
    });
}
