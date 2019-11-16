if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Manganelo",
        mirrorIcon: "manganelo.png",
        languages: "en",
        domains: ["manganelo.com"],
        home: "https://manganelo.com/",
        chapter_url: /^\/chapter\/.*\/.*$/g,

        abstract: "MangakakalotAbs",
        abstract_options: {
            base_url: "https://manganelo.com/"
        }
        
    });
}