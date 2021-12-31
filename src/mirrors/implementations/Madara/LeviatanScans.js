if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Leviatan Scans',
        mirrorIcon: 'leviatanscans.png',
        languages: 'en',
        domains: ['leviatanscans.com'],
        home: 'https://leviatanscans.com/',
        canListFullMangas: true,
        chapter_url: /\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,

        abstract: 'Madara',
        abstract_options: {
            search_url: 'https://leviatanscans.com/',
            chapter_list_ajax: true,
            path_length: 3,
            sort_chapters: true,
            isekai_chapter_url: true,
            urlProcessor: (url) => {
                let t = url.split('/')
                t.splice(3, 1)
                return t.join('/')
            }
        },
    });
}
