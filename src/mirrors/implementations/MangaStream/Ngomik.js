if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "Ngomik",
        canListFullMangas: false,
        mirrorIcon: "ngomik.png",
        domains: ["ngomik.in"],
        home: "https://ngomik.in/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://ngomik.in/",
            search_a_sel: "div.luf > a",
            chapters_a_sel: "div.lch> a"
        },
    })
}
