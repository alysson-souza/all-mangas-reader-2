if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Kiryuu",
        canListFullMangas: false,
        mirrorIcon: "kiryuu.png",
        domains: ["kiryuu.co", "kiryuu.id"],
        home: "https://kiryuu.id/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://kiryuu.id/",
            chapters_a_sel: "#chapterlist li .eph-num a",
            chapters_text_sel: ".chapternum",
            img_sel: ".wp-post-image",
            img_src: "data-lazy-src",
            search_json: false,
        },
    })
}
