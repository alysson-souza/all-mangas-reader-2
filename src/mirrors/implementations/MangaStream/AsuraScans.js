if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Asura Scans",
        canListFullMangas: false,
        mirrorIcon: "asurascans.png",
        domains: ["www.asurascans.com", "asura.gg", "asura.nacm.xyz"],
        home: "https://asura.nacm.xyz",
        // chapter_url: /\/.*?(chapter|ch)-[0-9]+\//g,
        languages: "en",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: this.home,
            chapters_a_sel: "div.bixbox.bxcl ul li div.eph-num a",
            chapters_text_sel: "span.chapternum",
            search_json: false,
            img_sel: `#readerarea img[width!="1px"]:not(".asurascans")`,
            img_src: "src",
            flame_scans_fuckery: true
        }
    })
}
