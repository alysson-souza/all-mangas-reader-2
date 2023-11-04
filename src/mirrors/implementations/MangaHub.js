if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Hub",
        canListFullMangas: false,
        mirrorIcon: "mangahub.png",
        languages: "en",
        domains: ["mangahub.io"],
        home: "https://mangahub.io/",
        chapter_url: /\/chapter\/.*\/chapter-.*/g,

        getMangaList: async function (search) {
            let res = await this.searchPage(this.home + "search?q=" + search)
            return res
        },

        searchPage: async function (url) {
            let doc = await amr.loadPage(url, { preventimages: true })
            let res = []
            $("._1KYcM h4 a", doc).each(function (ind) {
                res.push([$(this).text(), $(this).attr("href")])
            })

            let nextPage = $("ul.pager li.next:first", doc)
            if (nextPage.length > 0) {
                res = [...res, ...(await this.searchPage(nextPage.attr("href")))]
            }
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            $("li._287KE a._3pfyN", doc).each(function (index) {
                res.push([$("span._3D1SJ", this).text() + " " + $("span._2IG5P", this).text(), $(this).attr("href")])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let seriesLink = $("._1Gflr a", doc)
            return {
                name: seriesLink.text(),
                currentMangaURL: seriesLink.attr("href"),
                currentChapterURL: curUrl.includes("?") ? curUrl.split("?")[0] : curUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            let parts = curUrl.split("/")
            let slug = parts[4]
            let chapter = parts[5].replace("chapter-", "")

            let cookie = await amr.getCookie({
                url: this.home,
                name: "mhub_access"
            })

            if (chapter.includes("?")) {
                chapter = chapter.split("?")[0]
            }

            let json = await amr.loadJson("https://api.mghubcdn.com/graphql", {
                post: true,
                data: `{"query":"{chapter(x:m01,slug:\\"${slug}\\",number:${chapter}){id,title,mangaID,number,slug,date,pages,noAd,manga{id,title,slug,mainSlug,author,isWebtoon,isYaoi,isPorn,isSoftPorn,unauthFile,isLicensed}}}\"}`,
                headers: {
                    "x-amr-change-Referer": this.home,
                    "x-amr-change-Origin": "https://mangahub.io",
                    accept: "application/json",
                    "x-amr-change-sec-fetch-site": "cross-site",
                    "x-mhub-access": cookie.value
                }
            })

            // let req = await fetch('https://api.mghubcdn.com/graphql', {
            //     method: 'POST',
            //     mode: 'cors',
            //     cache: 'no-cache',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'accept': 'application/json',
            //         'origin': curUrl,
            //         'x-referer': curUrl
            //     },
            //     body: `{"query":"{chapter(x:m01,slug:\\"${slug}\\",number:${chapter}){id,title,mangaID,number,slug,date,pages,noAd,manga{id,title,slug,mainSlug,author,isWebtoon,isYaoi,isPorn,isSoftPorn,unauthFile,isLicensed}}}\"}`,
            // })

            // let json = req.json()

            console.debug("Mangahub", chapter, json)

            let res = []
            let cdnUrl = "https://img.mghubcdn.com/file/imghub/"
            // let cdnUrl = "https://imgx.mghubcdn.com/"
            let pages = Object.values(JSON.parse(json.data.chapter.pages))

            if (typeof pages[1] == "string") {
                for (page of pages) {
                    res.push(cdnUrl + page)
                }
            } else {
                for (page of pages[1]) {
                    res.push(cdnUrl + pages[0] + page)
                }
            }
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("img.PB0mN", doc).length > 0
        }
    })
}
