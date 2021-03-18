if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Elpsykongroo",
        mirrorIcon : "elpsykongroo.png",
        languages : "en",
        domains: ["elpsykongroo.pw"],
        home: "https://elpsykongroo.pw",
        disabled: true,
        chapter_url: /^\/r\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://elpsykongroo.pw/r",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}