if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Mangazuki",
        mirrorIcon: "mangazuki.png",
        languages: "en",
        domains: ["mangazuki.co"],
        home: "https://mangazuki.co/",
        chapter_url: /^\/fs\/read\/.+$/g,
        canListFullMangas: true,

        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "https://mangazuki.co"
        }
    })
}