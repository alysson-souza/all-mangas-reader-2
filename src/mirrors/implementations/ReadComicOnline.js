if (typeof registerMangaObject === "function") {
    registerMangaObject({
        mirrorName: "Read Comic Online",
        canListFullMangas: true,
        mirrorIcon: "readcomiconline.png",
        languages: "en",
        domains: ["readcomiconline.to", "readcomiconline.li"],
        home: "https://readcomiconline.li",
        chapter_url: /Comic\/.*\/.*\?id=/g,

        getMangaList: async function (search) {
            let doc = await amr.loadPage(this.home + "/Search/Comic", {
                nocache: true,
                preventimages: true,
                post: true,
                data: {
                    keyword: search
                }
            })
            let res = []
            let self = this
            $("table.listing a", doc).each(function (index) {
                if ($(this).attr("href").includes("/Comic/")) {
                    res.push([$(this).text().trim(), self.home + $(this).attr("href")])
                }
            })
            return res
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let res = []
            let self = this
            let comicName = $("a.bigChar", doc).text().trim()
            $("table.listing a", doc).each(function (index) {
                if ($(this).attr("href").includes("/Comic/")) {
                    res.push([$(this).text().replace(comicName, "").trim(), self.home + $(this).attr("href")])
                }
            })
            return res
        },

        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let comicUrl = $("#navsubbar a", doc)
            let nameParts = comicUrl.text().split("\n")
            let name = ""
            nameParts.forEach(part => {
                if (!(part.trim() == "" || part.trim() == "Comic" || part.trim() == "information")) {
                    name += part + " "
                }
            })

            let url = new URL(curUrl)
            let newUrl = url.origin + url.pathname + "?id=" + url.searchParams.get("id")
            return {
                name: name.trim(),
                currentMangaURL: this.home + comicUrl.attr("href"),
                currentChapterURL: newUrl
            }
        },

        getListImages: async function (doc, curUrl) {
            const unpack = (urlImg, origin = false) => {
                let src = urlImg.replace(/_x236/g, "d").replace(/_x945/g, "g")
                let alt = origin !== false
                if (!alt) origin = "https://2.bp.blogspot.com/"

                if (src.indexOf("https") !== 0) {
                    // if encoded
                    const cmark = src.substring(src.indexOf("?"))

                    let sIndex = src.indexOf("=s0?")
                    const isSizeZero = sIndex > 0
                    if (!isSizeZero) sIndex = src.indexOf("=s1600?")

                    src = src.substring(4, sIndex)
                    src = src.substring(0, 18) + src.substring(21)
                    src = src.substring(0, src.length - 6) + src[src.length - 2] + src[src.length - 1]

                    src = atob(src)

                    src = src.substring(0, 13) + src.substring(17)
                    src = src.substring(0, src.length - 2) + (isSizeZero ? "=s0" : "=s1600")

                    src = origin + src + cmark
                } else if (alt) {
                    // if not encoded, we still need to replace origin, when given
                    src = src.replace("https://2.bp.blogspot.com/", origin)
                }
                return src
            }

            doc = await amr.loadPage(curUrl + "&readType=1&quality=hq", { nocache: true })
            let regex = /lstImages\.push\(['"](.*?)['"]\);/g
            const matches = doc.innerText.matchAll(regex)

            regex = /beau\(lstImages,\s*['"](?<origin>.*?)['"]\);/
            let { origin = false } = doc.innerText.match(regex).groups ?? {}
            if (origin.length === 0) origin = false

            return Array.from(matches, match => unpack(match[1], origin))
        },

        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },

        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $("#divImage img", doc).length > 0
        }
    })
}
