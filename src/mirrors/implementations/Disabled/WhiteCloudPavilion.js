if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "White Cloud Pavilion",
        mirrorIcon: "whitecloudpavilion.png",
        languages: "en",
        domains: ["whitecloudpavilion.com"],
        home: "https://whitecloudpavilion.com/",
        chapter_url: /^\/manga\/(?:patreon|free)\/manga\/.+?\/.*$/g,
        disabled: true,

        abstract: "MyMangaReaderCMS",
        abstract_options: {
            base_url: "https://whitecloudpavilion.com/manga/patreon"
        }
    })
}
