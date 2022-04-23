if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Asura Scans",
        canListFullMangas: false,
        mirrorIcon: "asurascans.png",
        domains: ["www.asurascans.com"],
        home: "https://www.asurascans.com/",
        // chapter_url: /\/.*?(chapter|ch)-[0-9]+\//g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://www.asurascans.com/",
            chapters_a_sel: "div.bixbox.bxcl ul li div.eph-num a",
            chapters_text_sel: "span.chapternum",
            search_json: false,
            img_sel: `#readerarea img[width!="1px"]:not(".asurascans")`,
            img_src: "src",
            flame_scans_fuckery: true,
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
        }
    })
}
