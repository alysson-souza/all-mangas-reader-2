if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Atelier Du Noir",
        mirrorIcon : "atelierdunoir.png",
        languages : "en",
        domains: ["atelierdunoir.org"],
        home: "http://atelierdunoir.org/",
        chapter_url: /^\/reader\/read\/.*$/g,

        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://atelierdunoir.org/reader",
            mglist_look_title_from_a: a => $("h4", $(a).closest(".caption")).text()
        }
    })
}