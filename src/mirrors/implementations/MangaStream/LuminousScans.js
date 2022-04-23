if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Luminous Scans",
        canListFullMangas: false,
        mirrorIcon: "luminousscans.png",
        domains: ["www.luminousscans.com", "luminousscans.com"],
        home: "https://www.luminousscans.com/",
        chapter_url: /chapter-[0-9]+\/$/g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://www.luminousscans.com/",
            chapters_a_sel: "div.bixbox.bxcl ul li div.eph-num a",
            chapters_text_sel: "span.chapternum"
        }
    })
}
