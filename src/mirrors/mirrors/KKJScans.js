if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'KKJ Scans',
        mirrorIcon: 'kkjscans.png',
        languages: 'en',
        domains: ['kkjscans.co'],
        home: 'https://kkjscans.co/',
        disabled: true,
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.*$/g,
        abstract: 'GenkanAbs',
        abstract_options: {
            base_url: 'https://kkjscans.co/',
        },
    });
}
