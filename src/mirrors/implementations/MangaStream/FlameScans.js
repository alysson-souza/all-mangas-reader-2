if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Flame Scans",
        canListFullMangas: false,
        mirrorIcon: "flamescans.png",
        domains: ["flamescans.org", "flamecomics.com"],
        home: "https://flamecomics.com",
        //chapter_url: /\/.*?chapter-[0-9]+.*\//g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://flamecomics.com",
            chapters_a_sel: "div.bixbox.bxcl ul li a",
            chapters_text_sel: "span.chapternum",
            search_json: false,
            img_sel: `#readerarea img[width!="1px"][class*="size-"]`,
            img_src: "src",
            // flame_scans_fuckery: true
            fixChapterUrl: origUrl => {
                let parts = origUrl.split("/")

                if (parts.length > 5) {
                    parts.splice(3, 1)
                }

                let parts2 = parts[3].split("-")

                if (!isNaN(parts2[0]) && !isNaN(parseFloat(parts2[0]))) parts2.shift()

                parts[3] = parts2.join("-")
                return parts.join("/")
            },
            fixSeriesUrl: origUrl => {
                let parts = origUrl.split("/")
                if (parts[3] !== "series") {
                    parts.splice(3, 1)
                }

                let parts2 = parts[4].split("-")

                if (!isNaN(parts2[0]) && !isNaN(parseFloat(parts2[0]))) parts2.shift()

                parts[4] = parts2.join("-")
                return parts.join("/")
            }
        }
    })
}
