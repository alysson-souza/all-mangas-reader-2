if (typeof registerMangaObject === 'function') {
    
    registerMangaObject({
        mirrorName: "Mangaseno",
        canListFullMangas: false,
        mirrorIcon: "mangaseno.png",
        domains: ["mangaseno.com"],
        home: "https://mangaseno.com/",
        chapter_url: /^\/m[0-9]+\/$/g,
        languages: "id",
        abstract: "MangastreamAbs",
        abstract_options: {
            search_url: "https://mangaseno.com/",
            search_a_sel: "div.luf > a",
            chapters_a_sel: "div.lch> a",
            manga_title_attr: true,
            
        },      
    })
}