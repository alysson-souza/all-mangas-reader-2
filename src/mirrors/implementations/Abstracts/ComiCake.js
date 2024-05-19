/**
 * Abstract implementation for all sites based on ComiCake
 */
globalThis["ComiCake"] = function (options) {
    this.default_options = {
        series_list_url: "/directory/",
        series_list_selector: ".mdc-card__media-title a",
        chapter_list_selector: 'a[href*="/read/"]',
        chapter_information_selector: ".mdc-toolbar__section .etext a",
        images_selector: "main img",
        chapter_determine_selector: "div#br-slider img",
        chapter_determine_strip_selector: "main#cakeClassic"
    }
    this.options = Object.assign(this.default_options, options)
    this.mirrorName = "ComiCake"
    this.canListFullMangas = true

    this.getMangaList = async function (search) {
        let self = this
        let res = []
        let doc = await amr.loadPage(this.options.reader_url + this.options.series_list_url)

        $(this.options.series_list_selector, doc).each(function () {
            res.push([$(this).text().trim(), self.options.reader_url + $(this).attr("href")])
        })
        return res
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        let res = []
        let self = this
        $(this.options.chapter_list_selector, doc).each(function (index) {
            res.push([$(this).text(), self.stripUrl(self.options.reader_url + $(this).attr("href"))])
        })

        return res
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        doc = await this.getStripMode(doc, curUrl)
        let link = $(this.options.chapter_information_selector, doc)
        return {
            name: link.text(),
            currentMangaURL: this.options.reader_url + link.attr("href"),
            currentChapterURL: this.stripUrl(curUrl)
        }
    }

    this.getListImages = async function (doc, curUrl) {
        let res = []
        doc = await this.getStripMode(doc, curUrl)
        $(this.options.images_selector, doc).each(function () {
            res.push($(this).attr("src"))
        })
        return res
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = async function (doc, curUrl) {
        return (
            $(this.options.chapter_determine_selector, doc).length > 0 ||
            $(this.options.chapter_determine_strip_selector, doc).length > 0
        )
    }

    /*
        Load chapters in list mode because it relies on html instead of javascript to load the images
    */
    this.getStripMode = async function (doc, curUrl) {
        if (!this.isStripMode(curUrl)) {
            doc = await amr.loadPage(this.stripUrl(curUrl), { nocache: true })
        }
        return doc
    }

    this.stripUrl = function (curUrl) {
        return (this.isStripMode(curUrl) ? curUrl : curUrl + "/strip").replace(/\/\//g, "/")
    }

    this.isStripMode = function (curUrl) {
        let url = new URL(curUrl)
        let path = url.pathname
        return path.split("/").includes("strip")
    }
}

if (typeof registerAbstractImplementation === "function") {
    registerAbstractImplementation("ComiCake")
}
