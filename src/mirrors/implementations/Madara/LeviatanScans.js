if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Leviatan Scans",
        mirrorIcon: "leviatanscans.png",
        languages: "en",
        domains: ["leviatanscans.com", "en.leviatanscans.com"],
        home: "https://en.leviatanscans.com/",
        canListFullMangas: true,
        chapter_url: /\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,

        abstract: "Madara",
        // Random comment for non empty commit
        abstract_options: {
            search_url: "https://en.leviatanscans.com/",
            chapter_list_ajax: true,
            path_length: 2,
            sort_chapters: true,
            isekai_chapter_url: true,
            title_selector: "div.post-title > h1",
            // image_protection_plugin: true,
            urlProcessor: url => {
                let t = url.split("/")
                if (t[3] != "manga") t.splice(3, 1)
                return t.join("/")
            }
        }
    })
}
