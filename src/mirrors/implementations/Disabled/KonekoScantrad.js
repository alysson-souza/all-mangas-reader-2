if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Koneko Scantrad",
        mirrorIcon: "konekoscantrad.png",
        languages: "fr",
        domains: ["lel.koneko-scantrad.fr"],
        home: "https://koneko-scantrad.fr",
        chapter_url: /^\/read\/.+$/g,
        disabled: true,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://lel.koneko-scantrad.fr",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
