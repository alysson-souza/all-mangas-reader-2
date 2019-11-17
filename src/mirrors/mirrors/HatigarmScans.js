if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Hatigarm Scans",
        mirrorIcon: "hatigarmscans.png",
        languages: "en",
        domains: ["www.hatigarmscans.net"],
        home: "http://www.hatigarmscans.net/",
        chapter_url: /^\/manga\/.*\/.*$/g,
        
        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "http://www.hatigarmscans.net"
        },

        test_options: {
            search_phrase: "on"
        },
    })
}