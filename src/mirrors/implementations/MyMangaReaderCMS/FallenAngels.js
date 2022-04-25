if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Fallen Angels",
        mirrorIcon: "fallenangels.png",
        languages: "en",
        domains: ["manga.fascans.com"],
        home: "https://manga.fascans.com/",
        chapter_url: /^\/manga\/.*\/.+$/g,

        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "https://manga.fascans.com"
        }
    })
}
