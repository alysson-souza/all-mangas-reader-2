if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Le Cercle du Scan",
        mirrorIcon: "lecercleduscan.png",
        languages: "fr",
        domains: ["lel.lecercleduscan.com"],
        home: "https://lel.lecercleduscan.com",
        chapter_url: /^\/read\/.+$/g,
        disabled: true,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://lel.lecercleduscan.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
