if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Shoujo Hearts",
        mirrorIcon : "shoujohearts.png",
        languages : "en",
        domains: ["shoujohearts.com"],
        home: "http://shoujohearts.com/",
        chapter_url: /^\/reader\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://shoujohearts.com/reader",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
