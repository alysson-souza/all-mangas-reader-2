if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Rizz Comic",
        canListFullMangas: false,
        mirrorIcon: "rizz-comic.png",
        domains: ["rizzcomic.com"],
        home: "https://rizzcomic.com/",
        chapter_url: /chapter-[0-9]/g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            chapters_a_sel: `.eph-num a[href*="rizzcomic.com"]`,
            chapters_text_sel: "span.chapternum"
        }
    })
}
