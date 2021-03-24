if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "World Three",
        mirrorIcon : "worldthree.png",
        languages : "en",
        domains: ["www.slide.world-three.org"],
        home: "http://www.world-three.org/",
        chapter_url: /^\/read\/.+$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://www.slide.world-three.org",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}