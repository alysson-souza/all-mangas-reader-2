if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Manga Bob',
        mirrorIcon: 'mangabob.webp',
        languages: 'en',
        domains: ['mangabob.com'],
        home: 'https://mangabob.com/',
        canListFullMangas: true,
        chapter_url: /^\/manga\/.*\/.*$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: 'https://mangabob.com/',
            chapter_list_ajax: true
        },
    });
}
