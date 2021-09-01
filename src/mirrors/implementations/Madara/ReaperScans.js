if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: 'Reaper Scans',
        mirrorIcon: 'reaperscans.png',
        languages: 'en',
        domains: ['reaperscans.com'],
        home: 'https://reaperscans.com/',
        canListFullMangas: false,
        // chapter_url: /^\/series\/.*\/.+$/g,
        abstract: 'Madara',
        abstract_options: {
            search_url: 'https://reaperscans.com/',
            chapter_list_ajax: false,
            // chapter_list_ajax_selctor: 'div#manga-chapters-holder',
            // chapter_list_ajax_selctor_type: 'html',
            chapters_a_sel: 'li.wp-manga-chapter > a'
        },
    });
}