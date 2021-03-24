if (typeof registerMangaObject === 'function') {
	registerMangaObject({
        mirrorName : "WebToons",
        canListFullMangas : false,
        mirrorIcon : "webtoons.png",
        languages : "en",
        domains: ["www.webtoons.com"],
        home: "https://www.webtoons.com",
        chapter_url: /^.*\/viewer.+$/g,

        fixUrl: function(url) {
            if (!url.includes(this.home)) {
                return this.home + url
            }
        },

        getMangaList : async function (search) {
            await this.setCookie()
            let doc = await amr.loadPage(
                this.home + "/en/search?keyword=" + search, 
                { nocache: true, preventimages: true }
            )
            let self = this
            let resOrig = []
            $(".challenge_lst li a, .card_lst li a", doc).each(function (index) {
                resOrig.push([
                    $(".subj", $(this)).text().trim(),
                    self.fixUrl($(this).attr("href"))
                ])
            })

            let res = []
            for (let results of resOrig) {
                let doc2 = await amr.loadPage(results[1], {preventimages: true})
                let url = doc2.innerText.match(/<meta property="og:url" content="([^"]+)" \/>/)
                res.push([
                    results[0],
                    url[1]
                ])
            }
            return res
        },
    
        getListChaps : async function (urlManga) {
            await this.setCookie()
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = [];
            $(".detail_lst li > a", doc).each(function (index) {
                res.push([$(".tx", $(this)).text().trim() + " - " + $(".subj span", $(this)).text().trim(), $(this).attr("href")]);
            });
            while ($(".paginate > a[href='#']", doc).next().length > 0) {
                let nextpage = "https://www.webtoons.com" + $(".paginate > a[href='#']", doc).next().attr("href")
                doc = await amr.loadPage(nextpage, { nocache: true, preventimages: true })
                $(".detail_lst li > a", doc).each(function (index) {
                    res.push([$(".tx", $(this)).text().trim() + " - " + $(".subj span", $(this)).text().trim(), $(this).attr("href")]);
                });
            }
            return res
        },
    
        getInformationsFromCurrentPage : async function (doc, curUrl) {
            var name = $(".subj_info a", doc).text();
            var url = $(".subj_info a", doc).attr("href");
            return {
                "name" : name.trim(),
                "currentMangaURL" : url,
                "currentChapterURL" : curUrl
            };
        },
    
        getListImages : async function (doc, curUrl) {
            var res = [];
            $("#_imageList img", doc).each(function (index) {
                res.push($(this).attr("data-url"))
            });
            return res;
        },
    
        getImageFromPageAndWrite : async function (urlImg, image) {
            $(image).attr("src", urlImg);
        },

        isCurrentPageAChapterPage : function (doc, curUrl) {
            return ($("#_imageList img", doc).length > 0);
        },

        setCookie : async function() {
            amr.setCookie({ // set the cookie for english
                name: "locale",
                value: "en",
                url: this.home,
                path: "/",
                domain: ".webtoons.com",
                expirationDate: new Date().getTime() + (24*60*60*1000)
            })
        }
    })
}