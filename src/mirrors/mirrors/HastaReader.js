if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Hasta Reader",
        mirrorIcon : "hastareader.png",
        languages : "it",
        domains: ["hastareader.com"],
        home: "https://hastareader.com/",
        chapter_url: /^\/slide\/read\/.*$/g,
        canListFullMangas: false, /* to avoid loading 8 pages to load all mangas */

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://hastareader.com/slide",
            search_all: false, /* use FoolSlide search function */
            mglist_selector: ".title > a[href*='/series/']"
        },

        test_options: {
            images_restricted_domain: true
        },
    })
}