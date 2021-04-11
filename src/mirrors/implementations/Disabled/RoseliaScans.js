if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Roselia Scans",
        mirrorIcon : "roseliascans.png",
        languages : "en",
        domains: ["reader.roseliascans.com"],
        home: "http://roseliascans.com/",
        chapter_url: /^\/read\/.+$/g,
        disabled: true,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://reader.roseliascans.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}