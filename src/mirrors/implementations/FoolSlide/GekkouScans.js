if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Gekkou Scans",
        mirrorIcon : "gekkouscans.png",
        languages : "pt",
        domains: ["leitor.mangascenter.com.br"],
        home: "http://leitor.mangascenter.com.br",
        chapter_url: /^\/read\/.+$/g,
        canListFullMangas: false, /* to avoid loading 8 pages to load all mangas */
        disabled: true,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://leitor.mangascenter.com.br",
            search_all: false, /* use FoolSlide search function */
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}