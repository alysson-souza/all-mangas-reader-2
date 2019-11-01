if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "The Cat Scans",
        mirrorIcon : "catscans.png",
        languages : "en",
        domains: ["reader.thecatscans.com"],
        home: "http://reader.thecatscans.com/",
        chapter_url: /^\/read\/.*$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://reader.thecatscans.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}