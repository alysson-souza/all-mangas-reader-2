/**
 * Abstract implementation for all sites based on ComiCake
 */
window["ComiCake"] = function(options) {
    this.default_options = {
        series_list_url: "/directory/",
        listchaps_reverse: true 
    }
    this.options = Object.assign(this.default_options, options)
    this.mirrorName = "ComiCake"
    this.canListFullMangas = true
    this.chapter_url = /^\/read\/.*\/.*$/g

    this.getMangaList = async function (search) {
        let self = this
        let res = []
        let doc = await amr.loadPage(this.options.reader_url + this.options.series_list_url)

        $('.mdc-card__media-title a', doc).each(function() {
            res.push([
                $(this).text().trim(),
                self.options.reader_url + $(this).attr('href')
            ])
        })
        return res
    }


    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        let res = []
        let self = this
        $("a[href*='/read/']", doc).each(function (index) {
            res.push([
                $(this).text(), 
                self.options.reader_url + $(this).attr("href")
            ])
        })
        if (this.options.listchaps_reverse) {
            res = res.reverse()
        }
        return res
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        let link = $('div#br-topbar > .br-toolbar__tsection a', doc)
        return {
            "name" : link.text(),
            "currentMangaURL" : link.attr('href'),
            "currentChapterURL" : curUrl
        }
    }

    this.getListImages = async function (doc, curUrl) {
        let res = []
        $('div#br-slider img', doc).each(function() {
            res.push($(this).attr('src'))
        })
        return res
    },

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg);
    }

    this.isCurrentPageAChapterPage = async function (doc, curUrl) {
        return $('div#br-slider img', doc).length > 0;
    }
    this.doSomethingBeforeWritingScans = function (doc, curUrl) {
        $('body', doc).empty()
    }
}

if (typeof registerAbstractImplementation === 'function') {
    registerAbstractImplementation("ComiCake")
}