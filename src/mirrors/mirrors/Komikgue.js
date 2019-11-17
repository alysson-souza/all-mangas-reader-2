if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Komikgue",
        mirrorIcon: "id.png",
        languages: "id",
        domains: ["www.komikgue.com","komikgue.com"],
        home: "http://www.komikgue.com",
        chapter_url: /^\/manga\/.*\/.*$/g,
        
        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "http://www.komikgue.com",
            chapters_element: "td.chapter > a",
            img_src: "src"
        }
    })
}