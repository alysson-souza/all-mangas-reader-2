/**
 * Abstract implementation for all sites based on madara theme http://demo.mangabooth.com
 */
globalThis["Madara"] = function (options) {
    ;(this.default_options = {
        search_a_sel: "div.post-title > h4 > a",
        chapters_a_sel: "li.wp-manga-chapter > a",
        page_container_sel: "div.reading-content",
        img_sel: "div.reading-content img",
        path_length: 2,
        search_json: true,
        chapter_list_ajax: false,
        chapter_list_ajax_selctor: "manga",
        chapter_list_ajax_selctor_type: "variable",
        title_selector: "div.post-title > h1",
        img_src: "src",
        secondary_img_src: "data-src",
        add_list_to_chapter_url: true,
        sort_chapters: false,
        isekai_chapter_url: false,
        image_protection_plugin: false,
        urlProcessor: url => url,
        chapterInformationsSeriesName: (doc, url) => undefined,
        chapterInformationsSeriesUrl: (doc, url) => null,
        doBefore: () => {}
    }),
        (this.options = Object.assign(this.default_options, options))
    this.mirrorName = "Madara"
    this.canListFullMangas = false
    this.getMangaList = async function (search) {
        let searchApiUrl = this.options.search_url + "wp-admin/admin-ajax.php"
        var res = []

        if (this.options.search_json) {
            let json = await amr.loadJson(searchApiUrl, {
                nocache: true,
                preventimages: true,
                post: true,
                processData: false,
                headers: { "X-Requested-With": "XMLHttpRequest", "Content-type": "application/x-www-form-urlencoded" },
                data: {
                    action: "wp-manga-search-manga",
                    title: search
                }
            })

            if (json.success) {
                for (let i in json.data) {
                    let item = json.data[i]
                    res.push([item.title, item.url])
                }
            }
        } else {
            // Load search page
            let urlManga = this.options.search_url + "?s=" + search + "&post_type=wp-manga"
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            const self = this
            $(this.options.search_a_sel, doc).each(function (index) {
                res[res.length] = [$(this).text(), self.options.urlProcessor($(this).attr("href"))]
            })
        }
        return res
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        let self = this
        let mangaName = $(this.options.search_a_sel, doc).text().trim()

        if (this.options.chapter_list_ajax) {
            let searchApiUrl = this.options.search_url + "wp-admin/admin-ajax.php"
            let mangaVar

            if (this.options.isekai_chapter_url)
                searchApiUrl = (urlManga.endsWith("/") ? urlManga : urlManga + "/") + "ajax/chapters/"

            if (this.options.chapter_list_ajax_selctor_type == "variable")
                mangaVar = amr.getVariable(this.options.chapter_list_ajax_selctor, doc).manga_id
            else mangaVar = $(this.options.chapter_list_ajax_selctor, doc).attr("data-id")

            doc = await amr.loadPage(searchApiUrl, {
                nocache: true,
                preventimages: true,
                post: true,
                data: {
                    action: "manga_get_chapters",
                    manga: mangaVar
                }
            })
        }

        var res = []
        $(this.options.chapters_a_sel, doc).each(function (index) {
            let chapterName = $(this).text()
            let stringsToStrip = [
                mangaName,
                $(".chapter-release-date", this).text(),
                $(".view", this).text(),
                $(".chapterdate", this).text()
            ]

            stringsToStrip.forEach(x => (chapterName = chapterName.replace(x, "")))

            res.push([
                chapterName.trim(),
                self.options.urlProcessor(self.makeChapterUrl($(this).attr("href"))) // add ?style=list to load chapter in long strip mode, remove it if it already there and add it again,
            ])
        })

        if (this.options.sort_chapters) {
            res.sort((a, b) => {
                let aM = a[0]
                    .replace(/chapter/gi, "")
                    .replace(/volume/gi, "")
                    .replace(/chap/gi, "")
                    .replace(/volume/gi, "")
                let bM = b[0]
                    .replace(/chapter/gi, "")
                    .replace(/volume/gi, "")
                    .replace(/chap/gi, "")
                    .replace(/volume/gi, "")
                if (aM && bM) {
                    return parseFloat(aM) > parseFloat(bM) ? -1 : 1
                }
                return 0
            })
        }

        return res
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        let url = new URL(this.options.urlProcessor(curUrl))
        let path = url.pathname
        let pathSplitted = path.split("/").filter(p => p != "")
        let mangaPath = pathSplitted.slice(0, this.options.path_length)
        // console.debug(
        //     this.options.chapterInformationsSeriesUrl(doc, curUrl) || url.origin + "/" + mangaPath.join("/") + "/",
        //     this.options.chapterInformationsSeriesUrl(doc, curUrl),
        //     url.origin + "/" + mangaPath.join("/") + "/"
        // )
        let mangaurl =
            this.options.chapterInformationsSeriesUrl(doc, curUrl) || url.origin + "/" + mangaPath.join("/") + "/"
        let mgname = this.options.chapterInformationsSeriesName(doc, curUrl)
        if (mgname === undefined || mgname.trim() === "") {
            if ($(`a[href="${mangaurl}"]:not(:contains("Manga Info")):not(:contains("Novel Info"))`, doc).length > 0) {
                mgname = $(`a[href="${mangaurl}"]:not(:contains("Manga Info")):not(:contains("Novel Info"))`, doc)
                    .first()
                    .text()
                    .trim()
            }
        }
        if (mgname === undefined || mgname.trim() === "") {
            let docmg = await amr.loadPage(mangaurl)
            mgname = $("div.post-title > h3", docmg).text().trim()
            if (mgname === undefined || mgname.trim() === "") {
                mgname = $(this.options.title_selector, docmg).text().trim()
            }
        }
        return {
            name: mgname,
            currentMangaURL: mangaurl,
            currentChapterURL: this.options.urlProcessor(this.makeChapterUrl(curUrl))
        }
    }

    this.getListImages = async function (doc, curUrl) {
        if (this.options.image_protection_plugin) return this.protectedGetListImages(doc)

        res = []
        let self = this

        let preloadImages = await amr.getVariable("chapter_preloaded_images", doc)
        if (preloadImages !== this.undefined) {
            return preloadImages
        }
        $(this.options.img_sel, doc).each(function (index) {
            let img = $(this).attr(self.options.img_src)
            if (self.options.hasOwnProperty("secondary_img_src") && img === undefined) {
                img = $(this).attr(self.options.secondary_img_src)
            }
            res.push(img)
        })
        return res
    }

    this.protectedGetListImages = async function (doc) {
        let chapter_data = amr.getVariable("chapter_data", doc)
        let wpmangaprotectornonce = amr.getVariable("wpmangaprotectornonce", doc)

        const CryptoJSAesJson = {
            stringify: function (_0x8f41x2) {
                const _0x8f41x3 = { ct: _0x8f41x2.ciphertext.toString(amr.crypto.enc.Base64) }
                if (_0x8f41x2.iv) {
                    _0x8f41x3.iv = _0x8f41x2.iv.toString()
                }
                if (_0x8f41x2.salt) {
                    _0x8f41x3.s = _0x8f41x2.salt.toString()
                }
                return JSON.stringify(_0x8f41x3)
            },
            parse: function (_0x8f41x4) {
                const _0x8f41x5 = JSON.parse(_0x8f41x4)
                const _0x8f41x2 = amr.crypto.lib.CipherParams.create({
                    ciphertext: amr.crypto.enc.Base64.parse(_0x8f41x5.ct)
                })
                if (_0x8f41x5.iv) {
                    _0x8f41x2.iv = amr.crypto.enc.Hex.parse(_0x8f41x5.iv)
                }
                if (_0x8f41x5.s) {
                    _0x8f41x2.salt = amr.crypto.enc.Hex.parse(_0x8f41x5.s)
                }
                return _0x8f41x2
            }
        }

        let chapter_data_2 = JSON.parse(
            JSON.parse(
                amr.crypto.AES.decrypt(chapter_data, wpmangaprotectornonce, { format: CryptoJSAesJson }).toString(
                    amr.crypto.enc.Utf8
                )
            )
        )

        // console.debug('Chapter Data', chapter_data)
        // console.debug('Chapter Data Parsed', chapter_data_2, typeof chapter_data_2)
        return chapter_data_2
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = function (doc, curUrl) {
        return $(this.options.page_container_sel, doc).length > 0
    }

    this.makeChapterUrl = function (url) {
        let t = new URL(url)
        return this.stripLastSlash(t.origin + t.pathname) + (this.options.add_list_to_chapter_url ? "?style=list" : "")
    }

    this.stripLastSlash = function (url) {
        if (url.substring(url.length - 1) == "/") {
            url = url.substring(0, url.length - 1)
        }
        return url
    }
}

if (typeof registerAbstractImplementation === "function") {
    registerAbstractImplementation("Madara")
}
