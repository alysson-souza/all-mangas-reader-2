if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Champion Scans",
        mirrorIcon : "championscans.png",
        languages : "en",
        domains: ["reader.championscans.com"],
        home: "http://reader.championscans.com/",
        chapter_url: /^\/read\/.*$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://reader.championscans.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}