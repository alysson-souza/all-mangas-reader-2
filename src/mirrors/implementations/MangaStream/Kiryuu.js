if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Kiryuu",
        canListFullMangas: false,
        mirrorIcon: "kiryuu.png",
        domains: ["kiryuu.co"],
        home: "https://kiryuu.co/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://kiryuu.co/",
            chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a"
        },      
    })
}