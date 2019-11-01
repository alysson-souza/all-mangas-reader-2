if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Lolitannia",
        mirrorIcon : "lolitannia.png",
        languages : "en",
        domains: ["reader.holylolikingdom.net"],
        home: "http://www.holylolikingdom.net/",
        chapter_url: /^\/read\/.*$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://reader.holylolikingdom.net",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}