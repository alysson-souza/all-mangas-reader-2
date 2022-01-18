if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Dragon Tea",
        mirrorIcon: "dragon-tea.png",
        languages: "en",
        domains: ["dragontea.ink"],
        home: "https://dragontea.ink/",
        chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|novel)\/.*\/.+$/g,
        canListFullMangas: false,
        abstract: "Madara",
        abstract_options: {
            search_url: "https://dragontea.ink/",
            chapter_list_ajax: true,
            isekai_chapter_url: true,
        }
    })
}

