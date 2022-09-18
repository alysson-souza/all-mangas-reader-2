if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Twilight Scans",
        mirrorIcon: "twilightscans.png",
        languages: "en",
        domains: ["twilightscans.com"],
        home: "https://twilightscans.com/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://twilightscans.com/",
            chapter_list_ajax: true,
            isekai_chapter_url: true,
            secondary_img_src: "data-src"
        }
    })
}
