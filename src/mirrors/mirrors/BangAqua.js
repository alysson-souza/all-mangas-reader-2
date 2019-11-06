if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Bang Aqua",
        mirrorIcon : "bangaqua.png",
        languages : "en",
        domains: ["reader.bangaqua.com"],
        home: "http://bangaqua.com/",
        chapter_url: /^\/read\/.*$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://reader.bangaqua.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}