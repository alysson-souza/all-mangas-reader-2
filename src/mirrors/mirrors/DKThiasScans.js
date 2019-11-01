if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "DKThias Scans",
        mirrorIcon : "dkthiasscans.png",
        languages : "en",
        domains: ["reader.dkthias.com"],
        home: "http://reader.dkthias.com/",
        chapter_url: /^\/reader\/read\/.*$/g,
        
        abstract: "FoolSlide",
        abstract_options: {
            base_url: "http://reader.dkthias.com",
            series_list_url: "/reader/list/",
            mglist_selector: ".title > a[href*='/series/']",
            info_chapter_var: "baseurl"
        }
    })
}