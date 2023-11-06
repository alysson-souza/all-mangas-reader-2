if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Senses Scans",
        mirrorIcon: "sensesscans.png",
        languages: "en",
        domains: ["sensescans.com"],
        home: "http://sensescans.com/",
        chapter_url: /^\/reader\/read\/.+$/g,
        disabled: true,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://sensescans.com/reader",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
