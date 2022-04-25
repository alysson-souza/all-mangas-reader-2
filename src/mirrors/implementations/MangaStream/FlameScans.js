if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Flame Scans",
        canListFullMangas: false,
        mirrorIcon: "flamescans.png",
        domains: ["flamescans.org"],
        home: "https://flamescans.org",
        //chapter_url: /\/.*?chapter-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://flamescans.org",
            chapters_a_sel: "div.bixbox.bxcl ul li a",
            chapters_text_sel: "span.chapternum",
            search_json: false,
            img_sel: `#readerarea img[width!="1px"][class*="size-full"]`,
            img_src: "src",
            // flame_scans_fuckery: true
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
