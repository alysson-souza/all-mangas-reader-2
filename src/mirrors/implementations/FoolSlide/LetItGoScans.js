if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Let It Go Scans",
        mirrorIcon: "letitgoscans.png",
        languages: "en",
        domains: ["reader.letitgo.scans.today"],
        home: "http://letitgo-scans.blogspot.com/",
        chapter_url: /^\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://https://reader.letitgo.scans.today",
            mglist_selector: ".title > a[href*='/series/']"
        }
    });
}