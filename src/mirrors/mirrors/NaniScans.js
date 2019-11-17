if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Nani Scans",
        mirrorIcon : "naniscans.png",
        languages : "en",
        domains: ["reader.naniscans.xyz"],
        home: "https://naniscans.xyz/",
        chapter_url: /^\/read\/.*$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://reader.naniscans.xyz",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}