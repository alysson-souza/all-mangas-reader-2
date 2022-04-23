window["NextJs"] = function (options) {
    this.canListFullMangas = false
    this.defaultOptions = {
        nextDataRegex: /&lt;script\s+id="__NEXT_DATA__"\s+type="application\/json"&gt;(.*?)&lt;\/script&gt;/m,
        getTitle: json => "",
        getMangaList: json => [],
        getChapterList: (json, mangaUrl) => [],
        getImageList: json => [],
        isChapterPage: (json, pageUrl) => false
    }
    this.options = Object.assign(this.defaultOptions, options)

    this.getMangaList = async function (serch) {
        const doc = await amr.loadPage(this.home, {
            nocache: true,
            preventimages: true
        })
        const json = JSON.parse(doc["outerHTML"].match(this.options.nextDataRegex)[1])
        return this.options.getMangaList(json)
    }

    this.getListChaps = async function (mangaUrl) {
        let doc = await amr.loadPage(mangaUrl, {
            nocache: true,
            preventimages: true
        })
        const json = JSON.parse(doc["outerHTML"].match(this.options.nextDataRegex)[1])
        return this.options.getChapterList(json, mangaUrl)
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        let json = JSON.parse(doc["outerHTML"].match(this.options.nextDataRegex)[1])

        let mangaUrl = curUrl.split("/")
        mangaUrl.pop()

        return {
            name: this.options.getTitle(json),
            currentMangaURL: mangaUrl.join("/"),
            currentChapterURL: curUrl
        }
    }

    this.getListImages = async function (doc) {
        const json = JSON.parse(doc["outerHTML"].match(this.options.nextDataRegex)[1])
        return this.options.getImageList(json)
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = function (doc, pageUrl) {
        const json = JSON.parse(doc["outerHTML"].match(this.options.nextDataRegex)[1])
        return this.options.isChapterPage(json, pageUrl)
    }
}

if (typeof registerAbstractImplementation === "function") {
    registerAbstractImplementation("NextJs")
}
