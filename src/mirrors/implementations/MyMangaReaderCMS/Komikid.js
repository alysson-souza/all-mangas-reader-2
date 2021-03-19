if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Komikid",
        mirrorIcon: "id.png",
        languages: "id",
        domains: ["www.komikid.com","komikid.com"],
        home: "http://www.komikid.com",
        chapter_url: /^\/manga\/.*\/.+$/g,
        
        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "http://www.komikid.com",
            chapters_element: "ul.chapters > li > h5 > a"
        }
    })
}