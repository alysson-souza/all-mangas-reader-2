if (typeof registerMangaObject === "function") {
    registerMangaObject({
        disabled: true,
        mirrorName: "PM Scans",
        mirrorIcon: "pmscans.png",
        languages: "en",
        domains: ["reader.pmscans.com"],
        home: "https://reader.pmscans.com/",
        chapter_url: /^\/(.*?)chapter-(.*?)$/g,

        abstract: "MangastreamAbs",
        abstract_options: {
            search_json: false,
            search_url: "https://reader.pmscans.com/",
            chapters_a_sel: "div.bixbox.bxcl ul li div.eph-num a",
            chapters_text_sel: "span.chapternum"
        }
    })
}
