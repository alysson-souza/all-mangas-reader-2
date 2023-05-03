if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Nocturnal Scans",
        canListFullMangas: false,
        mirrorIcon: "nocturnal-scans.png",
        domains: ["nocturnalscans.com"],
        home: "https://nocturnalscans.com",
        chapter_url: /\/.*?-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangaStream_1_1_4Abs",
        abstract_options: {
            search_url: "https://nocturnalscans.com",
            chapter_list_selector: "#chapterlist .eph-num a"
            // chapters_text_sel: "span.chapternum"
        }
    })
}
