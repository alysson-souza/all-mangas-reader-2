if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "One Time Scans",
        mirrorIcon : "onetimescans.png",
        languages : "en",
        domains: ["reader.otscans.com"],
        home: "https://otscans.com/",
        chapter_url: /^\/read\/.*$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://reader.otscans.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}