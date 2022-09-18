if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Void Scans",
        mirrorIcon: "voidscans.png",
        languages: "en",
        domains: ["void-scans.com"],
        home: "https://void-scans.com/",
        chapter_url: /^\/.+chapter-\d+/g,
        canListFullMangas: false,

        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://void-scans.com",
            chapters_a_sel: "div.bixbox.bxcl ul li a",
            chapters_text_sel: "span.chapternum"
        }
    })
}
