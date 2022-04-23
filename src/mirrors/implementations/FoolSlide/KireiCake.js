if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Kirei Cake",
        mirrorIcon: "kireicake.png",
        languages: "en",
        domains: ["reader.kireicake.com"],
        home: "https://kireicake.com/",
        chapter_url: /^\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "https://reader.kireicake.com",
            series_list_url: "/reader/list/",
            mglist_selector: ".title > a[href*='/series/']",
            info_chapter_var: "baseurl"
        }
    })
}
