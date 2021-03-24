if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "The Cat Scans",
        mirrorIcon : "catscans.png",
        languages : "en",
        domains: ["reader2.thecatscans.com"],
        home: "http://reader2.thecatscans.com/",
        chapter_url: /^\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://reader2.thecatscans.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}