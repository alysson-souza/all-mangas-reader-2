/**
 * Abstract implementation for all sites based on FoolSlide
 */
window["FoolSlide"] = function (options) {
    this.default_options = {
        base_url: "http://foo.slide/",
        series_list_url: "/directory/",
        search_all: true, // how to search series : true search for the whole list (if multiple pages, can be heavy), false use the foolslide search function
        mglist_nextpage: ".next a:last", // the selector for next page button on series list
        mglist_selector: "a[href*='/series/']", // how to select manga from list
        mglist_look_title_from_a: a => $(a).text(), // while getting manga list, how to get manga title from a element
        listchaps_look_title_from_a: a => $(a).text(), // while getting chapters list, how to get chapter title from a element
        listchaps_reverse: false,
        info_manga_a: ".tbtitle.dnone a:first",
        info_look_title_from_a: a => $(a).text(), // while getting informations from page, how to get manga title from a manga info
        info_chapter_var: "base_url", // chapter url is stored in a variable in a script from the page, name of the variable,
        page_container: "#content" // selector for the page container
    }
    this.options = Object.assign(this.default_options, options)
    this.mirrorName = "FoolSlide"
    this.canListFullMangas = true

    this.getMangaList = async function (search) {
        let res = []
        let self = this

        if (this.options.search_all) {
            // search all pages,
            res = await this.searchPage(this.options.base_url + this.options.series_list_url)
        } else {
            res = await this.searchPage(this.options.base_url + "/search/", { post: true, data: { search: search } })
        }
        return res
    }

    this.searchPage = async function (url, options) {
        let res = []
        let self = this
        let doc = await amr.loadPage(url, Object.assign({ nocache: true, preventimages: true }, options))
        $(this.options.mglist_selector, doc).each(function (index) {
            res[res.length] = [self.options.mglist_look_title_from_a(this).trim(), $(this).attr("href")]
        })
        let nextpage_but = $(this.options.mglist_nextpage, doc)
        if (nextpage_but.length > 0) {
            res = [...res, ...(await this.searchPage(nextpage_but.attr("href"), options))]
        }
        return res
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        doc = await this.passAdult(doc, urlManga)
        let res = []
        let self = this
        $("a[href*='/read/']", doc).each(function (index) {
            res[res.length] = [self.options.listchaps_look_title_from_a(this).trim(), $(this).attr("href")]
        })
        if (this.options.listchaps_reverse) {
            res = res.reverse()
        }
        return res
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        doc = await this.passAdult(doc, curUrl)

        let mga = $(this.options.info_manga_a, doc)
        let base_url = amr.getVariable(this.options.info_chapter_var, doc)
        return {
            name: this.options.info_look_title_from_a(mga).trim(),
            currentMangaURL: mga.attr("href"),
            currentChapterURL: base_url
        }
    }
    ;(this.getListImages = async function (doc, curUrl) {
        doc = await this.passAdult(doc, curUrl)

        let pages = amr.getVariable("pages", doc)
        return pages.map(page => page.url)
    }),
        /**
         * For some manga, adult reading confirmation is required, lets do it
         * @param {*} doc
         * @param {*} curUrl
         */
        (this.passAdult = async function (doc, curUrl) {
            if ($("input[name='adult']", doc).length > 0) {
                doc = await amr.loadPage(curUrl, { post: true, data: { adult: true } })
            }
            return doc
        })
    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = async function (doc, curUrl) {
        doc = await this.passAdult(doc, curUrl)
        return $("#page img", doc).length > 0
    }
}

if (typeof registerAbstractImplementation === "function") {
    registerAbstractImplementation("FoolSlide")
}
