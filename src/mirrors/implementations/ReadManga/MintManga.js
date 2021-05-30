if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'MintManga',
        mirrorIcon: 'mintmanga.png',
        languages: 'ru',
        domains: ['mintmanga.live'],
        home: 'https://mintmanga.live',
        canListFullMangas: false,
        chapter_url: /^\/.*\/vol.*\/[0-9]+.+$/g,
        abstract: 'ReadMangaAbs',
        abstract_options: {
            base_url: 'https://mintmanga.live'
        },
    });
}