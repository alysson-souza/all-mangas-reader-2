if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Phoenix Serenade",
        mirrorIcon : "serenade.png",
        languages : "en",
        domains: ["reader.serenade.moe"],
        home: "https://serenade.moe/",
        chapter_url: /^\/read\/.+$/g,
        disabled: true,
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://reader.serenade.moe",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
