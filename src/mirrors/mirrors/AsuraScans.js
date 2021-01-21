if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Asura Scans",
        canListFullMangas: false,
        mirrorIcon: "asurascans.png",
        domains: ["asurascans.com"],
        home: "https://asurascans.com/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://asurascans.com/",
            chapters_a_sel: "div.bixbox.bxcl ul li div.eph-num a",
            chapters_text_sel: "span.chapternum",
            search_json: false,
            img_sel: `#readerarea img[data-src][width!="1px"]`,
            img_src: 'data-src'
        },      
    })
}