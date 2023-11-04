if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Realm Scans",
        canListFullMangas: false,
        mirrorIcon: "realm-scans.webp",
        domains: ["realmscans.xyz"],
        home: "https://realmscans.xyz/",
        chapter_url: /chapter-[0-9]/g,
        languages: "en",
        abstract: "MangastreamAbs",
        disabled: true,
        abstract_options: {
            search_url: "https://realmscans.xyz/",
            // series_list_selector: '.listupd a[href*="/series/"]',
            chapter_list_selector: `.eph-num a[href*="realmscans.xyz"]`
            // fixChapterUrl: url => {
            //     // return url
            //     let parts = url.split("/")
            //     if (parts.length == 6) parts.splice(3, 1)
            //     return parts.join("/")
            // },
            // fixSeriesUrl: url => {
            //     // return url
            //     let parts = url.split("/")
            //     if (parts[3] !== "series") parts.splice(3, 1)
            //     return parts.join("/")
            // }
        }
    })
}
