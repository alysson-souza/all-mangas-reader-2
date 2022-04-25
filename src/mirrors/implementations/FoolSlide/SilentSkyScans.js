if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Silent Sky Scans",
        mirrorIcon: "silentskyscans.png",
        languages: "en",
        domains: ["reader.silentsky-scans.net"],
        home: "https://reader.silentsky-scans.net/",
        chapter_url: /^\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://reader.silentsky-scans.net",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
