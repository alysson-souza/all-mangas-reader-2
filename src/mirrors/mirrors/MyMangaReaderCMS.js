/**
 * Abstract implementation for all sites based on FoolSlide
 */
window["MyMangaReaderCMS"] = function (options) {
    this.default_options = {
        base_url: "https://mymangareadercms/",
        chapters_element: "ul.chapters a[href*='/manga/']",
        img_src: "data-src"
    }
    this.options = Object.assign(this.default_options, options || {})
    this.mirrorName = "MyMangaReaderCMS"
    this.canListFullMangas = false

    this.getMangaList = async function (search) {
        let res = []
        if (!this.canListFullMangas) {
            let json = await amr.loadJson(
                this.options.base_url + "/search?query=" + search,
                { nocache: true }
            )
            var sugs = json.suggestions;
            for (let obj of sugs) {
                res[res.length] = [obj.value, this.options.base_url + "/manga/" + obj.data];
            }
        } else {
            let doc = await amr.loadPage(this.options.base_url + "/manga-list", { nocache: true, preventimages: true })
            $("h5.media-heading > a[href*='/manga/']", doc).each(function() {
                res.push([$(this).text().trim(), $(this).attr("href")])
            })
        }
        return res
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        let res = []
        $(this.options.chapters_element, doc).each(function () {
            res.push([$(this).text(), $(this).attr("href")])
        })
        return res
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        var name;
        var currentMangaURL;
        var currentChapterURL;
        var chap = $("#chapter-list li.active a", doc);
        currentChapterURL = chap.attr("href");
        var mg = $("#navbar-collapse-1 > .nav > li > a[href*='/manga/']", doc);
        name = mg.text();
        if (name.endsWith("Manga")) name = name.substring(0, name.length - 5).trim();
        currentMangaURL = mg.attr("href");
        return {
            "name": name,
            "currentMangaURL": currentMangaURL,
            "currentChapterURL": currentChapterURL
        }
    }

    this.getListImages = async function (doc, curUrl) {
        let self = this;
        var res = [];
        $(".viewer-cnt #all img", doc).each(
            function () {
                var src = $(this).attr(self.options.img_src);
                if (src && src !== '') {
                    if (src.indexOf("//") === 0) src = this.protocol() + src;
                    res.push(src.trim())
                }
            }
        )
        return res
    }

    this.protocol = function () {
        return this.options.base_url.substr(0, this.options.base_url.indexOf("/"));
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg);
    }

    this.whereDoIWriteScans = function (doc, curUrl) {
        return $(".viewer-cnt", doc);
    }
    this.isCurrentPageAChapterPage = function (doc, curUrl) {
        return $("#ppp img.scan-page", doc).length > 0;
    }
    this.doSomethingBeforeWritingScans = function (doc, curUrl) {
        $(".viewer-cnt", doc).empty()
        $(".pager-cnt", doc).remove()
    }
    this.doAfterMangaLoaded = function (doc, curUrl) {
    }
}

if (typeof registerAbstractImplementation === 'function') {
    registerAbstractImplementation("MyMangaReaderCMS")
}