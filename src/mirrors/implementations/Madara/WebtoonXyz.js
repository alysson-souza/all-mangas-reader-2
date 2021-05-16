if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Webtoon.xyz",
        mirrorIcon: "webtoon-xyz.png",
        languages: "en",
        domains: ["www.webtoon.xyz"],
        home: "https://www.webtoon.xyz/",
        chapter_url: /^\/read\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://www.webtoon.xyz/",
            chapter_list_ajax: true
        }
    })
}

