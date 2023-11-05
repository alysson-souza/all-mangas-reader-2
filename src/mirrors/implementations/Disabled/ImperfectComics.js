if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Imperfect Comics",
        mirrorIcon: "imperfect-comics.png",
        languages: "en",
        domains: ["imperfectcomic.org"],
        home: "https://imperfectcomic.org/",

        // chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        chapter_url: /\/.*?chapter-[0-9]+.*\//g,
        canListFullMangas: false,
        abstract: "Madara",
        disabled: true,
        abstract_options: {
            search_url: "https://imperfectcomic.org/",
            page_container_sel: "div#readerarea img",
            img_sel: "div#readerarea img",
            // chapter_list_ajax: true,
            chapters_a_sel: "#chapterlist li a",
            chapterInformationsSeriesUrl: (doc, curUrl) => {
                return $(".headpost a", doc).first().attr("href")
            },
            chapterInformationsSeriesName: (doc, curUrl) => {
                return $(".headpost a", doc).first().text().trim()
            }
        }
    })
}
