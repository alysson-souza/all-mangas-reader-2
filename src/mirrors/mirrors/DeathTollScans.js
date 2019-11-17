if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Death Toll Scans",
        mirrorIcon : "deathtollscans.png",
        languages : "en",
        domains: ["reader.deathtollscans.net"],
        home: "https://reader.deathtollscans.net/",
        chapter_url: /^\/read\/.*$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://reader.deathtollscans.net",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}