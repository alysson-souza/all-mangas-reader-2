if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Komiku",
        canListFullMangas: false,
        mirrorIcon: "komiku.png",
        domains: ["komiku.co"],
        home: "https://komiku.co/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://komiku.co/",
            chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a",
            search_a_sel: "h4.newsjudul > a",
            search_option: "&post_type=manga",
            manga_title_attr: false,
            page_container_sel: "#readerareaimg",
            manga_url_sel: "#hot > p > a",
            chapters_a_sel: "td.judulseries > a",
            manga_name_replace:"Manga",
            img_sel: "#readerareaimg img",
            search_json: false
        },
    })
}
