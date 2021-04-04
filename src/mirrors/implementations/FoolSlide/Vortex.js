if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Vortex Scans",
        mirrorIcon : "vortex.png",
        languages : "en",
        domains: ["reader.vortex-scans.com"],
        home: "https://vortex-scans.com/",
        chapter_url: /^\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://reader.vortex-scans.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
