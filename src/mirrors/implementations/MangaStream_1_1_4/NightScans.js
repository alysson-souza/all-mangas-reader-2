if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Night Scans",
        canListFullMangas: false,
        mirrorIcon: "night-scans.png",
        domains: ["nightscans.org"],
        home: "https://nightscans.org",
        chapter_url: /\/.*?-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangaStream_1_1_4Abs",
        abstract_options: {
            search_url: "https://nightscans.org",
            chapter_list_selector: "#chapterlist .eph-num a"
            // chapters_text_sel: "span.chapternum"
        }
    })
}
