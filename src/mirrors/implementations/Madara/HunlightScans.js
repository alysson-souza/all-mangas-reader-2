if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Hunlight Scans",
        mirrorIcon: "hunlightscans.png",
        languages: "en",
        domains: ["hunlight-scans.info"],
        home: "https://hunlight-scans.info/home",
        canListFullMangas: true,
        chapter_url: /^\/comics\/.*\/.+$/g,
        abstract: "GenkanAbs",
        abstract_options: {
            base_url: "https://hunlight-scans.info/"
        }
    })
}
