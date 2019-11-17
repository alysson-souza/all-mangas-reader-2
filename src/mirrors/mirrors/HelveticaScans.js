if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Helvetica Scans",
        mirrorIcon : "helvetica.png",
        languages : "en",
        domains: ["helveticascans.com"],
        home: "https://helveticascans.com/",
        chapter_url: /^\/r\/read\/.*$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://helveticascans.com/r",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}