if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Mangaichi Scans",
        mirrorIcon: "mangaichiscans.png",
        languages: "en",
        domains: ["mangaichiscans.mokkori.fr"],
        home: "http://mangaichiscans.mokkori.fr/",
        chapter_url: /^\/fs\/read\/.+$/g,
        disabled: true,
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://mangaichiscans.mokkori.fr/fs",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
