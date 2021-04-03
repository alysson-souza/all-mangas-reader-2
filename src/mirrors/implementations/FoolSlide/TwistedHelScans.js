if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "Twisted Hel Scans",
        mirrorIcon : "twistedhelscans.png",
        languages : "en",
        domains: ["www.twistedhelscans.com"],
        home: "http://www.twistedhelscans.com/",
        chapter_url: /^\/read\/.+$/g,
        disabled: true,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://www.twistedhelscans.com",
            mglist_look_title_from_a: a => $(".card_title", $(a)).text(),
            page_container: ".isreaderc"
        }
    })
}