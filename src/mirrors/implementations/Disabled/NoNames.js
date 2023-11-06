if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "The No Names",
        mirrorIcon: "nonames.png",
        languages: "en",
        domains: ["the-nonames.com"],
        home: "https://the-nonames.com/",
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.+$/g,
        abstract: "GenkanAbs",
        disabled: true,
        abstract_options: {
            base_url: "https://the-nonames.com/"
        }
    })
}
