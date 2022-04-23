if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Pecintakomik",
        canListFullMangas: false,
        disabled: true,
        mirrorIcon: "pecintakomik.png",
        domains: ["www.pecintakomik.net", "pecintakomik.net"],
        home: "https://www.pecintakomik.net/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://www.pecintakomik.net/",
            chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a",
            search_a_sel: "div.luf > a",
            search_option: "&post_type=manga",
            manga_title_attr: true,
            chapters_a_sel: "div.bxcl > ul > li > span.lchx > a"
        }
    })
}
