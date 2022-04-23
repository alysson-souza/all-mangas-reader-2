if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Forgotten Scans",
        mirrorIcon: "fos.png",
        languages: "en",
        domains: ["reader.fos-scans.com"],
        home: "http://fos-scans.com/",
        disabled: true,
        chapter_url: /^\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://reader.fos-scans.com",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
