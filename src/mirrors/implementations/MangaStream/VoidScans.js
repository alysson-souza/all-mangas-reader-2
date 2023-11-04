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
            chapters_text_sel: "span.chapternum",
            // img_src: "data-lazy-src",
            img_src: "src",
            fixChapterUrl: url => {
                const parts = url.split("/")
                if (parts[3] == "1") parts.splice(3, 1)
                return parts.join("/")
            }
        }
    })
}
