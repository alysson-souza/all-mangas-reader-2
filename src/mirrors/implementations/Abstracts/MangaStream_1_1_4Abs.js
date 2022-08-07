globalThis["MangaStream_1_1_4Abs"] = function (options) {
    this.defaultOptions = {
        base_url: "",
        series_list_selector: '.listupd a[href*="/manga/"]',
        chapter_list_selector: ".eph-num a",
        manga_url_selector: ".allc a"
    }
    this.options = Object.assign(this.defaultOptions, options)
    this.mirrorName = "MangaStream_1_1_4Abs"
    this.canListFullMangas = false

    this.getMangaList = async function (search) {
        let res = []
        let urlManga = this.options.base_url + "?s=" + search
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })

        $(this.options.series_list_selector, doc).each(function (index) {
            res.push([$(this).find(".tt").text().trim(), $(this).attr("href")])
        })
        return res
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        let res = []
        $(this.options.chapter_list_selector, doc).each(function (index) {
            res.push([$(".chapternum", this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        var mgtitle = $(this.options.manga_url_selector, doc)
        return {
            name: mgtitle.text(),
            currentMangaURL: mgtitle.attr("href"),
            currentChapterURL: curUrl
        }
    }

    this.getListImages = async function (doc, curUrl) {
        let res = []
        let regex = /ts_reader\.run\((.*?)\);/g
        let parts = doc.innerText.match(regex)
        let json = JSON.parse(parts[0].replace("ts_reader.run(", "").replace(");", ""))

        json.sources.forEach(source => {
            source.images.forEach(image => {
                res.push(image)
            })
        })
        return res
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = async function (doc, curUrl) {
        return $("div#readerarea", doc).length > 0
    }
}

if (typeof registerAbstractImplementation === "function") {
    registerAbstractImplementation("MangaStream_1_1_4Abs")
}
