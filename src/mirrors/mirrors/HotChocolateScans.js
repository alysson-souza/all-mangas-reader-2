if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Hot Chocolate Scans",
        mirrorIcon : "hotchocolate.png",
        languages : "en",
        domains: ["hotchocolatescans.com"],
        home: "http://hotchocolatescans.com/",
        chapter_url: /^\/fs\/read\/.*$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://hotchocolatescans.com/fs",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}