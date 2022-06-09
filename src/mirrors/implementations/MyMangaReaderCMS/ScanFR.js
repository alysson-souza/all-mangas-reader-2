if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "ScanFR",
        mirrorIcon: "scanfr.png",
        languages: "fr",
        domains: ["scan-fr.cc", "www.scan-fr.cc", "scan-fr.org", "www.scan-fr.org"],
        home: "https://www.scan-fr.cc",
        chapter_url: /^\/manga\/.*\/.+$/g,

        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "https://www.scan-fr.org",
            chapters_element: "ul.chapterszozo a[href*='/manga/']"
        }
    })
}
