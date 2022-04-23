if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Komikstation",
        canListFullMangas: false,
        mirrorIcon: "komikstation.png",
        domains: ["www.komikstation.com", "komikstation.com"],
        home: "https://www.komikstation.com/",
        chapter_url: /chapter-[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://www.komikstation.com/",
            chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a",
            search_a_sel: " div.allgreen.genrelst > ul > li> div > div.left > a",
            search_option: "&post_type=manga",
            manga_title_attr: true,
            manga_url_sel: "div.chapterbody > div > article > div.headpost a"
        }
    })
}
