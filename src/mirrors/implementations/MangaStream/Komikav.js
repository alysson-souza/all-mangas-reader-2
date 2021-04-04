if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Komikav",
        canListFullMangas: false,
        mirrorIcon: "komikav.png",
        domains: ["komikav.com"],
        home: "https://komikav.com/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://komikav.com/",
            chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a"
        },
    })
}
