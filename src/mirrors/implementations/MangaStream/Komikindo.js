if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Komikindo",
        canListFullMangas: false,
        mirrorIcon: "id.png",
        domains: ["www.komikindo.web.id","komikindo.web.id"],
        home: "https://www.komikindo.web.id",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        disabled: true,
        abstract_options: {
            search_url: "https://www.komikindo.web.id/",
            search_a_sel: "div.chlf > h2 > a",
            manga_title_attr: true,
        },      
    })
}