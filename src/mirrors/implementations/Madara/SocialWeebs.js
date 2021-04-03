if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Social Weebs',
        mirrorIcon: 'socialweebs.png',
        languages: 'en',
        domains: ['socialweebs.in'],
        home: 'https://socialweebs.in',
        chapter_url: /^\/manga\/.*\/.+$/g,

        abstract: 'Madara',
        abstract_options: {
            search_url: 'https://socialweebs.in/',
            chapter_list_ajax: true
        },
    });
}
