if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Luminous Scans",
        canListFullMangas: false,
        mirrorIcon: "luminousscans.png",
        domains: ["luminousscans.com", "luminousscans.gg"],
        home: "https://luminousscans.gg/",
        chapter_url: /chapter-[0-9]+.*\/$/g,
        languages: "en",
        abstract: "MangaStream_1_1_4Abs",
        abstract_options: {
            chapter_list_selector: "#chapterlist .eph-num a",
            urlProcessorSeries: url => {
                let parts = url.split("/")
                let parts2 = parts[5].split("-")
                console.debug(url, parts, parts2)

                if (!isNaN(parts2[0]) && !isNaN(parseFloat(parts2[0]))) parts2.shift()

                parts[5] = parts2.join("-")
                return parts.join("/")
            }
        }

        /*abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://www.luminousscans.com/",
            chapters_a_sel: "div.bixbox.bxcl ul li div.eph-num a",
            chapters_text_sel: "span.chapternum",
            img_sel: "#readerarea img.alignnone",
            fixChapterUrl: origUrl => {
                let parts = origUrl.split("/")

                let parts2 = parts[3].split("-")

                if (!isNaN(parts2[0]) && !isNaN(parseFloat(parts2[0]))) parts2.shift()

                parts[3] = parts2.join("-")
                return parts.join("/")
            },
            fixSeriesUrl: origUrl => {
                let parts = origUrl.split("/")

                let parts2 = parts[4].split("-")

                if (!isNaN(parts2[0]) && !isNaN(parseFloat(parts2[0]))) parts2.shift()

                parts[4] = parts2.join("-")
                return parts.join("/")
            }
        }*/
    })
}
