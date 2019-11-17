if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "S2Scans",
        mirrorIcon : "s2smanga.png",
        languages : "en",
        domains: ["reader.s2smanga.com"],
        home: "https://s2smanga.com/",
        chapter_url: /^\/read\/.*$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://reader.s2smanga.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}