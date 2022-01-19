if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Lily Manga',
        mirrorIcon: 'lilymanga.png',
        languages: 'en',
        domains: ['lilymanga.com'],
        home: 'https://lilymanga.com/',
        canListFullMangas: true,
        chapter_url: /^\/ys\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: 'https://lilymanga.com/',
            chapter_list_ajax: true,
            isekai_chapter_url: true
        },
    });
}
