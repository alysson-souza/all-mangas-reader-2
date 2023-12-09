if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Animated Glitched Scans",
        canListFullMangas: false,
        mirrorIcon: "anigli-scans.png",
        domains: ["anigliscans.com", "anigliscans.xyz"],
        home: "https://anigliscans.xyz",
        // chapter_url: /\/.*?chapter-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangaStream_1_1_4Abs",
        abstract_options: {
            search_url: "https://anigliscans.xyz"
            // chapters_a_sel: "div.bixbox.bxcl ul li a",
            // chapters_text_sel: "span.chapternum"
        }
    })
}
