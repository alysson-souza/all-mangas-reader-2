if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName: "Manga Rock",
        disabled: true,
        canListFullMangas: false,
        mirrorIcon: "mangarock.png",
        languages: "en",
        domains: ["mangarock.com"],
        home: "https://mangarock.com/",
        chapter_url: /\/manga\/.*\/chapter\/.*/g,
        api: "https://api.mangarockhd.com/query/web401/",

        getMangaList: async function (search) {
            let json = await amr.loadJson(
                this.api + "mrs_quick_search",
                {
                    post: true,
                    nocache: true,
                    dataType: "text",
                    data: search
                })
            let series = json.data.series,
                reqs = [],
                res = [];
            for (let serie of series) {
                reqs.push(
                    amr.loadJson(this.api + "info?oid=" + serie)
                       .then((result) => {
                            // get title from page
                            var title = result.data.name;
                            res.push([title, "https://mangarock.com/manga/" + serie]);
                        })
                )
            }
            await Promise.all(reqs)
            return res;
        },

        getListChaps: async function (urlManga) {
            let oid = urlManga.split("/")[4];
            let json = await amr.loadJson(this.api + "info?oid=" + oid, { nocache: true })
            let chaps = json.data.chapters;
            let res = [];
            for (let chap of chaps) {
                res.push([chap.name, "https://mangarock.com/manga/" + oid + "/chapter/" + chap.oid]);
            }
            return res.reverse()
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let oid = curUrl.split("/")[4];
            let choid = curUrl.split("/")[6];
            if (choid.indexOf("#") > 0) choid = choid.substr(0, choid.indexOf("#"));
            let res = {};
            let manga = await amr.loadJson(this.api + "info?oid=" + oid, { nocache: true })
            res.name = manga && manga.data ? manga.data.name : "Unknown";
            res.currentMangaURL = "https://mangarock.com/manga/" + oid;
            res.currentChapterURL = "https://mangarock.com/manga/" + oid + "/chapter/" + choid;
            return res;
        },

        getListImages: async function (doc, curUrl) {
            let choid = curUrl.split("/")[6];
            if (choid.indexOf("#") > 0) choid = choid.substr(0, choid.indexOf("#"));
            let chapter = await amr.loadJson(this.api + "pages?oid=" + choid)
            return chapter.data
        },

        getImageFromPageAndWrite: function (urlImg, image) {
            var xhr = new XMLHttpRequest();
            if (urlImg.indexOf("//") === 0) urlImg = location.protocol + urlImg
            xhr.open('GET', urlImg, true);
            xhr.responseType = 'arraybuffer';

            let self = this;
            xhr.onload = function(e) {
                var responseArray = new Uint8Array(this.response); // images are mri binry files
                image.src = self.webPDecode(responseArray); // mri file contains encoded webp
            };

            xhr.send();
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return curUrl.split("/").length === 7 && curUrl.split("/")[5] === "chapter";
        },

        webPDecode: function(t) {
            let u = function(t) {
                var e = function(t) {
                    for (var e = [], n = 0; n < t.length; n += 32768)
                        e.push(String.fromCharCode.apply(null, t.subarray(n, n + 32768)));
                    return e.join("")
                }(t);
                return btoa(e)
            }
            t = function(t) {
                var e = new Uint8Array(t.length + 15)
                  , n = t.length + 7;
                e[0] = 82,
                e[1] = 73,
                e[2] = 70,
                e[3] = 70,
                e[7] = n >> 24 & 255,
                e[6] = n >> 16 & 255,
                e[5] = n >> 8 & 255,
                e[4] = 255 & n,
                e[8] = 87,
                e[9] = 69,
                e[10] = 66,
                e[11] = 80,
                e[12] = 86,
                e[13] = 80,
                e[14] = 56;
                for (var r = 0; r < t.length; r++)
                    e[r + 15] = 101 ^ t[r];
                return e
            }(t)
            return "data:image/webp;base64," + u(t)
        }
    });
}
