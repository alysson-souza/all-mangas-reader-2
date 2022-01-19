if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        disabled: true,
        mirrorName: 'Manga Turf',
        mirrorIcon: 'mangaturf.png',
        languages: 'en',
        domains: ['mangaturf.com'],
        home: 'https://mangaturf.com/',
        canListFullMangas: true,
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: 'https://mangaturf.com/',
            chapter_list_ajax: true
        },
    });
}
