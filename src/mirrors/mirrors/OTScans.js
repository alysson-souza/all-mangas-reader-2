if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "One Time Scans",
        mirrorIcon : "onetimescans.png",
        languages : "en",
        domains: ["otscans.com"],
        home: "https://otscans.com/",
        chapter_url: /^\/foolslide\/read\/.*$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://otscans.com/foolslide",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}