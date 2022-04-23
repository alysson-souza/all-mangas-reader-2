if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Manga Here",
        canListFullMangas: false,
        mirrorIcon: "mangahere.png",
        languages: "en",
        domains: ["www.mangahere.cc", "m.mangahere.cc", "www.mangahere.co"],
        home: "https://www.mangahere.cc/",
        chapter_url: /\/manga\/.*\/.+\/.*/g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage("https://www.mangahere.cc/search?title=" + search, {
                nocache: true,
                preventimages: true
            })
            let res = []
            $(".line-list ul .manga-list-4-item-title > a", doc).each(function (index) {
                res[res.length] = [$(this).text().trim(), "https://www.mangahere.cc" + $(this).attr("href")]
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            if ($("#checkAdult", doc).length > 0) {
                amr.setCookie({
                    // set the cookie on fanfox domain
                    name: "isAdult",
                    value: "1",
                    path: "/",
                    url: urlManga,
                    domain: "www.mangahere.cc",
                    expirationDate: new Date().getTime() + 24 * 60 * 60 * 1000
                })
                doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            }
            let res = []
            $(".detail-main-list a", doc).each(function () {
                let url = "https://www.mangahere.cc" + $(this).attr("href")
                url = url.substr(0, url.lastIndexOf("/") + 1)
                res.push([$(".title3", $(this)).text(), url])
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let mga = $(".reader-header-title-1 a", doc)
            return {
                name: mga.text(),
                currentMangaURL: "https://www.mangahere.cc" + mga.attr("href"),
                currentChapterURL: curUrl.substr(0, curUrl.lastIndexOf("/") + 1)
            }
        },

        getListImages: async function (doc, curUrl) {
            let lastpage = amr.getVariable("imagecount", doc),
                curl = curUrl.substr(0, curUrl.lastIndexOf("/") + 1),
                res = []

            for (let i = 1; i <= lastpage; i++) {
                res.push(curl + i + ".html")
            }
            return res
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            // loads the page containing the current scan
            let doc = await amr.loadPage(urlImg)
            var mkey = ""
            if ($("#dm5_key", doc).length > 0) {
                mkey = $("#dm5_key", doc).val()
            }
            let curl = urlImg.substr(0, urlImg.lastIndexOf("/") + 1),
                cid = amr.getVariable("chapterid", doc),
                chapfunurl = curl + "chapterfun.ashx", // url to retrieve scan url
                curpage = amr.getVariable("imagepage", doc)
            let params = {
                // Build parameters for the request
                cid: cid,
                page: curpage,
                key: mkey
            }
            // get scan url (this function seems to work only within DM5, perhaps a control on Referer)
            let data = await amr.loadJson(chapfunurl, {
                data: params,
                nocontenttype: true,
                headers: { "X-Requested-With": "XMLHttpRequest" },
                referer: urlImg
            })
            // the retrieved data is packed through an obfuscator
            // dm5 is unpacking the images url through an eval, we can't do that in AMR due to CSP
            // we do it manually (below is the unpack function shipped with the data to decode)
            let unpack = function (p, a, c, k, e, d) {
                e = function (c) {
                    return (
                        (c < a ? "" : e(parseInt(c / a))) +
                        ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
                    )
                }
                if (!"".replace(/^/, String)) {
                    while (c--) d[e(c)] = k[c] || e(c)
                    k = [
                        function (e) {
                            return d[e]
                        }
                    ]
                    e = function () {
                        return "\\w+"
                    }
                    c = 1
                }
                while (c--) if (k[c]) p = p.replace(new RegExp("\\b" + e(c) + "\\b", "g"), k[c])
                return p
            }

            // regexp to parse the arguments to pass to the unpack function, just parse the 4 first arguments
            let regexpargs = /'(([^\\']|\\')*)',([0-9]+),([0-9]+),'(([^\\']|\\')*)'/g
            let match = regexpargs.exec(data)
            if (match) {
                args = [match[1], match[3], match[4], match[5].split("|"), 0, {}]
                let sc = unpack(...args) // call the unpack function
                sc = sc.replace(/\\'/g, "'") // unquote the result
                // the result is another js function containing the data, we mimic here what it does
                // retrieve the variables
                let pix = amr.getVariableFromScript("pix", sc),
                    pvalue = amr.getVariableFromScript("pvalue", sc) // array of scan urls (contains current one and next one)
                pvalue = pvalue.map(img => pix + img) // mimic the returned function which rebuilds the url depending on its parts
                $(image).attr("src", pvalue[0]) // set the image src
            } else {
                $(image).attr("src", "error")
            }
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(".reader-main", doc).length > 0
        }
    })
}
