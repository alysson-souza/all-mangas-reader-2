if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Cosmic Scans",
        canListFullMangas: false,
        mirrorIcon: "cosmic-scans.png",
        domains: ["cosmicscans.com", "cosmic-scans.com"],
        home: "https://cosmic-scans.com",
        chapter_url: /\/.*?chapter-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://cosmic-scans.com",
            chapters_a_sel: "div.bixbox.bxcl ul li a",
            chapters_text_sel: "span.chapternum"
        }
    })
}
