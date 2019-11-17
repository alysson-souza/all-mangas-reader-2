/**
 * Abstract implementation for all sites based on MangaStream theme https://mangastream.themesia.com/
 */
window["MangastreamAbs"] = function (options) {
    this.default_options = {
        search_a_sel: "div.bsx > a",
        chapters_a_sel: "div.cl > ul > li > span.leftoff > a",
        page_container_sel: "#readerarea",
        search_field: "s",
        search_option: "",
        manga_url_sel: "div.allc > a",
        img_sel: "#readerarea img",
        chapter_url_suffix: "",
        manga_title_attr: true,
        manga_name_replace: "",
        img_src: "src",
        search_json: true,
        doBefore: () => { }
    }
    this.options = Object.assign(this.default_options, options)
    this.mirrorName = "MangastreamAbs"
    this.canListFullMangas = false
    this.getMangaList = async function (search) {
        let self = this;
        var res = [];
        let urlManga = this.options.search_url + `?${this.options.search_field}=` + search + this.options.search_option;
        let searchApiUrl = this.options.search_url + "wp-admin/admin-ajax.php";
        if (this.options.search_json) {
            let json = await amr.loadJson(
                searchApiUrl,
                {
                    nocache: true,
                    preventimages: true,
                    post: true,
                    processData: false,
                    headers: { "X-Requested-With": "XMLHttpRequest", 'Content-type': 'application/x-www-form-urlencoded' },
                    data: {
                        action: "ajaxy_sf",
                        sf_value: search,
                        search: "false"
                    }
                }
            )
            if (json != []) {
                let mangas = json.manga[0].all;
                for (let i in mangas) {
                    let item = mangas[i];
                    res.push(
                        [
                            item["post_title"],
                            item["post_link"]
                        ]
                    );
                }
            }
        } else {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })

            $(this.options.search_a_sel, doc).each(function (index) {
                res[res.length] = [
                    self.options.manga_title_attr ? $(this).attr("title") : $(this).text().trim(),
                    $(this).attr("href")
                ];
            });
        }
        return res;
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        let self = this;
        var res = [];
        $(this.options.chapters_a_sel, doc).each(function (index) {
            res[index] = [
                $(this).text().trim(),
                $(this).attr("href") + self.options.chapter_url_suffix
            ];
        });
        res = res;
        return res;
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {

        let manga_url = $(this.options.manga_url_sel, doc).attr("href");
        let manga_name = $(this.options.manga_url_sel, doc).text();
        return {
            "name": manga_name.replace(this.options.manga_name_replace, "").trim(),
            "currentMangaURL": manga_url,
            "currentChapterURL": curUrl
        };
    }

    this.getListImages = async function (doc, curUrl) {
        let self = this;
        res = [];
        $(this.options.img_sel, doc).each(function (index) {
            res[res.length] = $(this).attr(self.options.img_src);
        });
        return res;
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = function (doc, curUrl) {
        return $(this.options.page_container_sel, doc).length > 0
    }
}

if (typeof registerAbstractImplementation === 'function') {
    registerAbstractImplementation("MangastreamAbs")
}
