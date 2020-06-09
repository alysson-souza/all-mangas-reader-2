if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Manga Turf',
        mirrorIcon: 'mangaturf.webp',
        languages: 'en',
        domains: ['mangaturf.com'],
        home: 'https://mangaturf.com/',
        canListFullMangas: true,
        chapter_url: /^\/manga\/.*\/.*$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: 'https://mangaturf.com/',
            chapter_list_ajax: true
        },
    });
}
