if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga 1st",
        mirrorIcon: "manga1st.png",
        languages: "en",
        domains: ["manga1st.com"],
        home: "https://manga1st.com/",
        // chapter_url: /^\/manga\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manga1st.com/",
            chapter_list_ajax: true
        }
    })
}

