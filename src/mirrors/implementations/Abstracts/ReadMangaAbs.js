globalThis["ReadMangaAbs"] = function (options) {
    this.defaultOptions = {
        base_url: ""
    }
    this.options = Object.assign(this.defaultOptions, options)
    this.mirrorName = "ReadMangaAbs"
    this.canListFullMangas = false

    this.getMangaList = async function (search) {
        let json = await amr.loadJson(this.options.base_url + "search/suggestion", {
            nocache: true,
            preventimages: true,
            type: "GET",
            dataType: "text",
            data: { query: search }
        })
        let res = []
        for (let sug of json.suggestions) {
            if (!sug.link.includes("/", 1)) {
                res[res.length] = [sug.value, this.options.base_url + sug.link]
            }
        }
        return res
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga + "?mtr=1", { nocache: true, preventimages: true })
        let mangaIdFromUrl = urlManga.split("/").pop()
        let res = []
        let self = this

        $("div.chapters-link a.chapter-link", doc).each(function (index) {
            var str = $(this).attr("href")
            str = str.split("/")[1]
            if (str === mangaIdFromUrl) {
                let nameParts = this.innerText.match(/^\s*\S.*$/gm).map(name => name.trim())
                if (nameParts[nameParts.length - 1] === "новое") nameParts.pop()
                let chapterName = nameParts[nameParts.length - 1]
                res[res.length] = [chapterName, self.options.base_url + $(this).attr("href")]
            }
        })
        return res
    }

    this.passAdult = async function (doc, curUrl) {
        if ($("a[href$='?mtr=1']", doc).length > 0) {
            doc = await amr.loadPage(curUrl + "?mtr=1")
        }
        return doc
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        var name = $($("#mangaBox h1 a:first-child", doc).contents()[0]).text()
        var nameurl = this.options.base_url + $("#mangaBox h1 a:first-child", doc).attr("href")
        var chapurl = curUrl.split("?")[0] + "?mtr=1"
        return {
            name: name,
            currentMangaURL: nameurl,
            currentChapterURL: chapurl
        }
    }

    this.getListImages = async function (doc, curUrl) {
        doc = await this.passAdult(doc, curUrl)

        var res = []
        var source = $.map($("#__amr_text_dom__", doc), el => $(el).text()).join(";")
        var matches = source.match(/rm_h\.(?:initReader|readerInit)\(.*?(\[\[.*?\]\])/)
        var hasOneWayImageServer = source.includes("https://one-way.work")
        if (matches) {
            matches = matches[1].replace(/'/g, '"')
            var b = JSON.parse(matches)
            for (var i = 0; i < b.length; i++) {
                if (hasOneWayImageServer) res[i] = "https://one-way.work/" + b[i][2].replace(/\?.*$/, "")
                else res[i] = b[i][0] + b[i][2]
            }
        }
        return res
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = async function (doc, curUrl) {
        doc = await this.passAdult(doc, curUrl)

        return $("img#mangaPicture", doc).length > 0
    }
}

if (typeof registerAbstractImplementation === "function") {
    registerAbstractImplementation("ReadMangaAbs")
}
