if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Alpha Scans",
        canListFullMangas: false,
        mirrorIcon: "alpha-scans.png",
        domains: ["alpha-scans.org"],
        home: "https://alpha-scans.org",
        chapter_url: /\/.*?chapter-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangastreamAbs",
        disabled: true,
        abstract_options: {
            search_url: "https://alpha-scans.org",
            chapters_a_sel: "div.bixbox.bxcl ul li a",
            chapters_text_sel: "span.chapternum"
        }
    })
}
