if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'GD Scans',
        mirrorIcon: 'gd-scans.png',
        languages: 'en',
        domains: ['gdegenscans.xyz'],
        home: 'https://gdegenscans.xyz/',
        canListFullMangas: true,
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        abstract: "Madara",
        abstract_options: {
            search_url: 'https://gdegenscans.xyz/',
            chapter_list_ajax: true
        },
    });
}
