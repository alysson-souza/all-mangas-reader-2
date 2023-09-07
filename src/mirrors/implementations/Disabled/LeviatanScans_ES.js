if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Leviatan Scans Spanish",
        mirrorIcon: "leviatanscans.png",
        languages: "es",
        domains: ["leviatanscans.com", "es.leviatanscans.com"],
        home: "https://es.leviatanscans.com/",
        canListFullMangas: true,
        chapter_url: /\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        disabled: true,

        abstract: "Madara",
        abstract_options: {
            search_url: "https://es.leviatanscans.com/",
            chapter_list_ajax: true,
            path_length: 2,
            sort_chapters: true,
            isekai_chapter_url: true,
            title_selector: "#manga-title > h1",
            urlProcessor: url => {
                let t = url.split("/")
                if (t[3] != "manga") t.splice(3, 1)
                return t.join("/")
            }
        }
    })
}
