if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Kangaryu Team",
        mirrorIcon : "kangaryuteam.png",
        languages : "fr",
        domains: ["kangaryu-team.fr"],
        home: "http://kangaryu-team.fr/",
        chapter_url: /^\/reader\/read\/.+$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://kangaryu-team.fr/reader",
            mglist_selector: ".title > a[href*='/series/']"
        }
    })
}
