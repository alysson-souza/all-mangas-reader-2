if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Let It Go Scans",
        mirrorIcon: "letitgo.png",
        languages: "en",
        domains: ["reader.letitgo.scans.today"],
        home: "http://letitgo-scans.blogspot.com/",
        chapter_url: /^\/read\/.*\/.+$/g,

        abstract: "ComiCake",
        abstract_options: {
            reader_url: "http://reader.letitgo.scans.today"
        }
    });
}