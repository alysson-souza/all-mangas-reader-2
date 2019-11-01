if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "ScanFR",
        mirrorIcon: "scanfr.png",
        languages: "fr",
        domains: ["www.scan-fr.co", "scan-fr.co"],
        home: "https://www.scan-fr.co",
        chapter_url: /^\/manga\/.*\/.*$/g,
        
        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "https://www.scan-fr.co",
            chapters_element: "ul.chapterszz a[href*='/manga/']"
        }
    })
}