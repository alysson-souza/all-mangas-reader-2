if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "ScanFR",
        mirrorIcon: "scanfr.png",
        languages: "fr",
        domains: ["www.scan-fr.co", "scan-fr.co", "www.scan-fr.cc"],
        home: "https://www.scan-fr.cc",
        chapter_url: /^\/manga\/.*\/.+$/g,

        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "https://www.scan-fr.cc",
            chapters_element: "ul.chapters888 a[href*='/manga/']"
        }
    })
}
