if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Evil Flowers",
        mirrorIcon : "evilflowers.png",
        languages : "en",
        domains: ["reader.evilflowers.com"],
        home: "http://reader.evilflowers.com",
        canListFullMangas: false, /* to avoid loading 8 pages to load all mangas */
        chapter_url: /^\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://reader.evilflowers.com",
            search_all: false, /* use FoolSlide search function */
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
