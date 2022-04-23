if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Westmanga",
        canListFullMangas: false,
        mirrorIcon: "westmanga.png",
        domains: ["westmanga.info"],
        home: "https://westmanga.info/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://westmanga.info/",
            chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a",
            search_a_sel: "div.kanan_search > header > span > a",
            search_option: "&post_type=manga",
            manga_title_attr: false,
            chapters_a_sel: "div.cl > ul > li > span.leftoff > a",
            search_json: false
        }
    })
}
