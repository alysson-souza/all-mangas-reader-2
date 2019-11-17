/**
 * Abstract implementation for all sites based on FoolSlide
 */
window["FunMangaAbs"] = function (options) {
    this.default_options = {
        search_url: "http://funmanga/",
        search_data_field: "search",
        search_a_sel: ".manga-title a",
        search_default_data: {},
        sendDataAsText: false,
        chapters_a_sel: "ul.chapter-list li > a",
        page_container_sel: "body > .content",
        img_sel: "img#chapter_img",
        doBefore: () => {}
    }
    this.options = Object.assign(this.default_options, options)
    this.mirrorName = "FunMangaAbs"
    this.canListFullMangas = false

    this.getMangaList = async function (search) {
        let opts = {
            nocache: true,
            preventimages: true,
            post: true,
            data: this.options.search_default_data
        }
        opts.data[this.options.search_data_field] = search
        if (this.options.sendDataAsText) {
            let str = ""
            for (let dt in opts.data) {
                str += "&" + dt + "=" + opts.data[dt]
            }
            opts.data = str.substr(1)
            opts.headers = {}
            opts.headers["X-Requested-With"] = "XMLHttpRequest"
        }
        
        let doc = await amr.loadPage(this.options.search_url, opts)
        let res = [];
        $(this.options.search_a_sel, doc).each(function (index) {
            res[index] = [$(this).attr("title").trim(), $(this).attr('href')];
        });
        return res;
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        let res = [];
        $(this.options.chapters_a_sel, doc).each(function () {
            res[res.length] = [$(".val", $(this)).text().trim(), $(this).attr("href")];
        });
        return res;
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        let mangaurl = amr.getVariable("manga_url", doc)
        let mgname;
        if ($("a[href='" + mangaurl + "']", doc).length > 0) {
            mgname = $("a[href='" + mangaurl + "']", doc).text()
        }
        if (mgname === undefined || mgname.trim() === "") {
            let docmg = await amr.loadPage(mangaurl)
            mgname = $(".panel-heading h1", docmg).text()
        }
        return {
            "name": mgname,
            "currentMangaURL": mangaurl,
            "currentChapterURL": amr.getVariable("chapter_url", doc)
        }
    }

    this.getListImages = async function (doc, curUrl) {
        let images = amr.getVariable("images", doc)
        return images.map(obj => obj.url)
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = function (doc, curUrl) {
        return $(this.options.img_sel, doc).length > 0
    }
}

if (typeof registerAbstractImplementation === 'function') {
    registerAbstractImplementation("FunMangaAbs")
}
