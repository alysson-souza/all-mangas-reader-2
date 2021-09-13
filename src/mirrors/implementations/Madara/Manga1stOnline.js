if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Manga 1st Online",
        mirrorIcon: "manga1st-online.jpg",
        languages: "en",
        domains: ["manga1st.online"],
        home: "https://manga1st.online/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://manga1st.online/",
        }
    })
}

