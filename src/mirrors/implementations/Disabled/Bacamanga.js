if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Bacamanga",
        canListFullMangas: false,
        disabled: true,
        mirrorIcon: "bacamanga.png",
        domains: ["bacamanga.co"],
        home: "https://bacamanga.co/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://bacamanga.co/",
            chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a"
        },
    })
}
