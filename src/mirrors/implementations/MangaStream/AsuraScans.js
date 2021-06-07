if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Asura Scans",
        canListFullMangas: false,
        mirrorIcon: "asurascans.png",
        domains: ["www.asurascans.com"],
        home: "https://www.asurascans.com/",
        chapter_url: /\/.*?chapter-[0-9]+\//g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://www.asurascans.com/",
            chapters_a_sel: "div.bixbox.bxcl ul li div.eph-num a",
            chapters_text_sel: "span.chapternum",
            search_json: false,
            img_sel: `#readerarea img[width!="1px"]`,
            img_src: 'src'
        },      
    })
}