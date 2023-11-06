if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Astra Scans",
        canListFullMangas: false,
        mirrorIcon: "astra-scans.png",
        domains: ["astrascans.com"],
        home: "https://astrascans.com/",
        chapter_url: /\-chapter\-\d.+\//g,
        languages: "en",

        abstract: "MangaStream_1_1_4Abs",
        abstract_options: {
            base_url: "https://astrascans.com/",
            urlProcessorChapter: url => {
                const parts = url.split("/")
                if (parts[3] == "10000") parts.splice(3, 1)
                return parts.join("/")
            }
        }
    })
}
