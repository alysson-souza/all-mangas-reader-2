if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "ReadMangaToday",
        canListFullMangas: true,
        mirrorIcon: "readmangatoday.png",
        languages: "en",
        domains: ["www.readmng.com"],
        home: "https://www.readmng.com/",
        // chapter_url: /^\/.*\/[0-9]+\.?[0-9]*\/.+$/g,

        abstract: "FunMangaAbs",
        abstract_options: {
            search_url: "https://www.readmng.com/search",
            search_data_field: "query",
            search_a_sel: ".content-list .title a",
            chapters_a_sel: "ul.chp_lst li > a"
        }
    })
}
