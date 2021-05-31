if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Flame Scans",
        canListFullMangas: false,
        mirrorIcon: "flamescans.png",
        domains: ["flamescans.org"],
        home: "https://flamescans.org",
        //chapter_url: /\/.*?chapter-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://flamescans.org",
            chapters_a_sel: "div.bixbox.bxcl ul li a",
            chapters_text_sel: "span.chapternum",
            search_json: false,
            img_sel: `#readerarea img[width!="1px"][class*="size-full"]`,
            img_src: 'src'
        },      
    })
}