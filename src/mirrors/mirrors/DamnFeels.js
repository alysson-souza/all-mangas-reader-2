if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Damn Feels",
        mirrorIcon : "damnfeels.png",
        languages : "en",
        domains: ["damn-feels.com"],
        home: "http://www.damn-feels.com",
        chapter_url: /^\/reader\/read\/.*$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://damn-feels.com/reader",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}