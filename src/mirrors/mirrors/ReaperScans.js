if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Reaper Scans',
        mirrorIcon: 'reaperscans.webp',
        languages: 'en',
        domains: ['reaperscans.com'],
        home: 'https://reaperscans.com/',
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.*$/g,
        abstract: 'GenkanAbs',
        abstract_options: {
            base_url: 'https://reaperscans.com/',
            images_include_base_url: false
        },
    });
}