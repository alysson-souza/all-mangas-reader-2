if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Manga Cultivator',
        mirrorIcon: 'manga-cultivator.png',
        languages: 'en',
        domains: ['mangacultivator.com'],
        home: 'https://mangacultivator.com/',
        canListFullMangas: true,
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: 'https://mangacultivator.com/',
            chapter_list_ajax: true,
            isekai_chapter_url: true
        },
    });
}
