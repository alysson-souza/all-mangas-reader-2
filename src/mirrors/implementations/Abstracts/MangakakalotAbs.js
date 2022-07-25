/**
 * Abstract implementation for all sites based on Mangakakalot
 */
globalThis["MangakakalotAbs"] = function (options) {
    this.default_options = {
        base_url: "",
        search_url: "search/",
        series_list_selector: ".story_name a",
        series_list_page_last_selector: "a.page_last",
        chapter_list_selector: ".chapter-list a",
        chapter_information_selector: '.rdfa-breadcrumb:first a[class!="home"]:first',
        images_selector: "#vungdoc img"
    }
    this.options = Object.assign(this.default_options, options)
    this.mirrorName = "MangakakalotAbs"
    this.canListFullMangas = false

    this.getMangaList = async function (search) {
        search = search.replace(/ /g, "_")
        let res = []
        let url = this.options.base_url + this.options.search_url + search
        let doc = await amr.loadPage(url, { nocache: true, preventimages: true })
        res.push(...this.searchPage(doc))

        let lastPage = $(this.options.series_list_page_last_selector, doc)
        if (lastPage.length > 0) {
            let pageCount = parseInt(new URLSearchParams(new URL(lastPage.attr("href")).search).get("page")) || 2
            for (i = 2; i <= pageCount; i++) {
                doc = await amr.loadPage(url + "?page=" + i, { nocache: true, preventimages: true })
                res.push(...this.searchPage(doc))
            }
        }

        return res
    }

    this.searchPage = function (doc) {
        let self = this
        let res = []
        $(this.options.series_list_selector, doc).each(function () {
            if (!$(this).attr("href").includes(self.options.base_url)) {
                // This is because multiple sites can be linked to each other
                return
            }
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        let res = []
        $(this.options.chapter_list_selector, doc).each(function (index) {
            res.push([$(this).text(), $(this).attr("href")])
        })

        return res
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        let link = $(this.options.chapter_information_selector, doc)
        return {
            name: link.text(),
            currentMangaURL: link.attr("href"),
            currentChapterURL: curUrl
        }
    }

    this.getListImages = async function (doc, curUrl) {
        let res = []
        $(this.options.images_selector, doc).each(function () {
            res.push($(this).attr("src"))
        })
        return res
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = async function (doc, curUrl) {
        return false
    }
}

if (typeof registerAbstractImplementation === "function") {
    registerAbstractImplementation("MangakakalotAbs")
}
