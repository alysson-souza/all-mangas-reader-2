if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Sea Otter Scans",
        mirrorIcon : "seaotter.png",
        languages : "en",
        domains: ["reader.seaotterscans.com"],
        home: "https://seaotterscans.com/",
        chapter_url: /^\/read\/.*$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://reader.seaotterscans.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}