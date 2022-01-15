if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        disabled: true,
        mirrorName : "Dokusha",
        mirrorIcon : "dokusha.png",
        languages : "en",
        domains: ["dokusha.info"],
        home: "http://dokusha.info",
        chapter_url: /^\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://dokusha.info",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
