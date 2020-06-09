if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Edelgarde Scans',
        mirrorIcon: 'edelgardescans.webp',
        languages: 'en',
        domains: ['edelgardescans.com'],
        home: 'https://edelgardescans.com/home',
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.*$/g,
        abstract: 'GenkanAbs',
        abstract_options: {
            base_url: 'https://edelgardescans.com/',
        },
    });
}
