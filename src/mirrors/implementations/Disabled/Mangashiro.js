if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Mangashiro",
        canListFullMangas: false,
        mirrorIcon: "mangashiro.png",
        domains: ["mangashiro.co"],
        home: "https://mangashiro.co/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        disabled: true,
        abstract_options: {
            search_url: "https://mangashiro.co/",
            chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a"
        }
    })
}
