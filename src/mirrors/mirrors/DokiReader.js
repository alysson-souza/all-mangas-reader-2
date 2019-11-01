if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Doki Reader",
        mirrorIcon : "doki.png",
        languages : "en",
        domains: ["kobato.hologfx.com"],
        home: "https://kobato.hologfx.com/",
        chapter_url: /^\/reader\/read\/.*$/g,
        canListFullMangas: false, /* to avoid loading 4 pages to load all mangas */
    
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://kobato.hologfx.com/reader",
            search_all: false, /* use FoolSlide search function */
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}