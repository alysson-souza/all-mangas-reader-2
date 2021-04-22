if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "CatManga",
        mirrorIcon: "catmanga.png",
        languages: "en",
        domains: ["catmanga.org"],
        home: "https://catmanga.org",
        chapter_url: /^\/series\/.*?\/\d+$/g,
        abstract: 'NextJs',
        canListFullMangas: true,

        abstract_options: {
            getTitle: (json) => {
                return json.props['pageProps']['series']['title'];
            },
            getMangaList: (json) => {
                let res = [];
                json.props['pageProps']['series'].forEach(series => {
                    res.push([series.title, `https://catmanga.org/series/${series['series_id']}`]);
                });
                return res;
            },
            getChapterList: (json, mangaUrl) => {
                const res = [];
                json.props['pageProps']['series']['chapters'].forEach(chapter => {
                    res.push([`${chapter.number} - ${chapter.title ?? 'N/A'}`, `${mangaUrl}/${chapter.number}`]);
                });
                return res.reverse();
            },
            getImageList: (json) => {
                const res = [];
                json.props['pageProps']['pages'].forEach(pageUrl => {
                    res.push(pageUrl);
                });
                return res;
            },
            isChapterPage: (json) => {
                return json.props['pageProps']['pages'].length > 0;
            }
        }
    });
}
