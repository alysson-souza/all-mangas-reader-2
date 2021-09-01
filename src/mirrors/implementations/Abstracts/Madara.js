/**
 * Abstract implementation for all sites based on madara theme http://demo.mangabooth.com
 */
window["Madara"] = function (options) {
    this.default_options = {
        search_a_sel: "div.post-title > h4 > a",
        chapters_a_sel: "li.wp-manga-chapter > a",
        page_container_sel: "div.reading-content",
        img_sel: "div.reading-content img",
        path_length: 2,
        search_json: true,
        chapter_list_ajax: false,
        chapter_list_ajax_selctor: 'manga',
        chapter_list_ajax_selctor_type: 'variable',
        img_src: "src",
        secondary_img_src: "data-src",
        sort_chapters: false,
        isekai_chapter_url: false,
        doBefore: () => { }
    },
    this.options = Object.assign(this.default_options, options)
    this.mirrorName = "Madara"
    this.canListFullMangas = false
    this.chapter_url= /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
    this.getMangaList = async function (search) {
        let searchApiUrl = this.options.search_url + "wp-admin/admin-ajax.php";
        var res = [];

        if(this.options.search_json){
            let json = await amr.loadJson(
                searchApiUrl,
                {
                    nocache: true,
                    preventimages: true,
                    post: true,
                    processData: false,
                    headers: { "X-Requested-With": "XMLHttpRequest", 'Content-type': 'application/x-www-form-urlencoded' },
                    data: {
                        action: "wp-manga-search-manga",
                        title: search
                    }
                }
            )

            if (json.success) {
                for (let i in json.data) {
                    let item = json.data[i];
                    res.push(
                        [
                            item.title,
                            item.url
                        ]
                    );
                }
            }
        }else{
        // Load search page
        let urlManga = this.options.search_url + "?s=" + search + "&post_type=wp-manga";
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })

        $(this.options.search_a_sel, doc).each(function (index) {
            res[res.length] = [
                $(this).text(),
                $(this).attr("href")
            ];
        });
        }
        return res;
    }

    this.getListChaps = async function (urlManga) {
        let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        let self = this
        let mangaName = $(this.options.search_a_sel, doc).text().trim()

        if (this.options.chapter_list_ajax) {
            let searchApiUrl = this.options.search_url + "wp-admin/admin-ajax.php"
            let mangaVar

            if (this.options.isekai_chapter_url) 
                searchApiUrl = (urlManga.endsWith('/') ? urlManga : urlManga + '/') + 'ajax/chapters/'
            
            if (this.options.chapter_list_ajax_selctor_type == 'variable')
                mangaVar = amr.getVariable(this.options.chapter_list_ajax_selctor, doc).manga_id
            else
                mangaVar = $(this.options.chapter_list_ajax_selctor, doc).attr('data-id')

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
                $('.chapter-release-date', this).text()
            ]
            
            stringsToStrip.forEach(x => chapterName = chapterName.replace(x, ''))
            
            res.push([
                chapterName.trim(),
                self.makeChapterUrl($(this).attr("href")) // add ?style=list to load chapter in long strip mode, remove it if it already there and add it again,
            ])
        })

        if (this.options.sort_chapters) {
            res.sort((a, b) => {
                let aM = a[0].replace(/chapter/gi, '').replace(/volume/gi, '').replace(/chap/gi, '').replace(/volume/gi, '')
                let bM = b[0].replace(/chapter/gi, '').replace(/volume/gi, '').replace(/chap/gi, '').replace(/volume/gi, '')
                if (aM && bM) {
                    return parseFloat(aM) > parseFloat(bM) ? -1 : 1
                }
                return 0
            })
        }

        return res
    }

    this.getInformationsFromCurrentPage = async function (doc, curUrl) {
        let url = new URL(curUrl);
        let path = url.pathname;
        let pathSplitted = path.split('/').filter(p => p != '');
        let mangaPath = pathSplitted.slice(0, this.options.path_length);
        let mangaurl = url.origin + '/' + mangaPath.join('/') + '/';
        let mgname;
        if ($(`a[href="${mangaurl}"]:not(:contains("Manga Info"))`, doc).length > 0) {
            mgname = $(`a[href="${mangaurl}"]:not(:contains("Manga Info"))`, doc).first().text().trim();
        }
        if (mgname === undefined || mgname.trim() === "") {
            let docmg = await amr.loadPage(mangaurl);
            mgname = $("div.post-title > h3", docmg).text().trim();
            if (mgname === undefined || mgname.trim() === "") {
                mgname = $("div.post-title > h1", docmg).text().trim();
            }
        }
        return {
            "name": mgname,
            "currentMangaURL": mangaurl,
            "currentChapterURL": this.makeChapterUrl(curUrl)
        };
    }

    this.getListImages = async function (doc, curUrl) {
        res = [];
        let self = this;

        let preloadImages = await amr.getVariable('chapter_preloaded_images', doc);
        if (preloadImages !== this.undefined) {
            return preloadImages;
        }
        $(this.options.img_sel, doc).each(function (index) {
            let img = $(this).attr(self.options.img_src)
            if (self.options.hasOwnProperty('secondary_img_src') && img === undefined) {
                img = $(this).attr(self.options.secondary_img_src)
            }
            res.push(img)
        });
        return res;
    }

    this.getImageFromPageAndWrite = async function (urlImg, image) {
        $(image).attr("src", urlImg)
    }

    this.isCurrentPageAChapterPage = function (doc, curUrl) {
        return $(this.options.page_container_sel, doc).length > 0
    }

    this.makeChapterUrl = function (url) {
        let t = new URL(url)
        return this.stripLastSlash(t.origin + t.pathname) + "?style=list"
    }

    this.stripLastSlash = function(url) {
        if (url.substring(url.length - 1) == "/") {
            url = url.substring(0, url.length - 1);
        }
        return url
    }
}

if (typeof registerAbstractImplementation === 'function') {
    registerAbstractImplementation("Madara")
}
