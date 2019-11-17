if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Mangakakalot",
        mirrorIcon: "mangakakalot.png",
        languages: "en",
        domains: ["mangakakalot.com"],
        home: "https://mangakakalot.com/",
        chapter_url: /^\/chapter\/.*\/.*$/g,

        abstract: "MangakakalotAbs",
        abstract_options: {
            base_url: "https://mangakakalot.com/"
        }
        
    });
}