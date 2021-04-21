if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Sorcerer Weekly",
        mirrorIcon : "sorcererweekly.png",
        languages : "en",
        domains: ["sorcererweekly.com"],
        home: "https://sorcererweekly.com/",
        chapter_url: /^\/read\/.+$/g,
        disabled: true,
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://sorcererweekly.com/reader",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}