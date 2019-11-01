if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Jaimini's Box",
        mirrorIcon : "jaiminisbox.png",
        languages : "en",
        domains: ["jaiminisbox.com"],
        home: "https://jaiminisbox.com/",
        chapter_url: /^\/reader\/read\/.*$/g,
        canListFullMangas: false, /* to avoid loading 3 pages to load all mangas */

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://jaiminisbox.com/reader",
            search_all: false, /* use FoolSlide search function */
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}