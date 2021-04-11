if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Twilight Scans",
        mirrorIcon: "twilightscans.png",
        languages: "en",
        domains: ["twilightscans.com"],
        home: "https://twilightscans.com/",
        chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://twilightscans.com/",
            chapter_list_ajax: true,
            secondary_img_src: "data-src"
        }
    })
}

