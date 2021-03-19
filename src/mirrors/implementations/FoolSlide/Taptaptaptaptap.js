if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Tappy tappy tap",
        mirrorIcon : "taptaptaptaptap.png",
        languages : "en",
        domains: ["taptaptaptaptap.net"],
        home: "https://taptaptaptaptap.net/",
        chapter_url: /^\/fs\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://taptaptaptaptap.net/fs/",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}