if (typeof registerMangaObject === 'function') {
    registerMangaObject({
        mirrorName: "PM Scans",
        mirrorIcon: "pmscans.jpg",
        languages: "en",
        domains: ["www.pmscans.com"],
        home: "http://www.pmscans.com/",
        chapter_url: /^\/manga\/.*\/.*$/g,

        options:  {
            search_url: "http://www.pmscans.com/",
            search_a_sel: "div.post-title > h4 > a",
            chapters_a_sel: "li.wp-manga-chapter > a",
            page_container_sel: "div.reading-content",
            img_sel: "div.reading-content img",
            img_src: "src",
            secondary_img_src: "data-src",
            search_json: true,
            chapter_list_ajax: true,
        },

        getMangaList: async function (search) {
            let searchApiUrl = this.home + "wp-admin/admin-ajax.php";
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
            let urlManga = this.home + "?s=" + search + "&post_type=wp-manga";
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
    
            $(this.options.search_a_sel, doc).each(function (index) {
                res[res.length] = [
                    $(this).text(),
                    $(this).attr("href")
                ];
            });
            }
            return res;
        },

        getListChaps: async function (urlManga) {
            let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
            let self = this
            var mangaName = $(this.options.search_a_sel, doc).text().trim()
    
            if (this.options.chapter_list_ajax) {
                let searchApiUrl = this.home + "wp-admin/admin-ajax.php"
                let mangaVar = amr.getVariable('manga', doc)
                doc = await amr.loadPage(searchApiUrl, { 
                    nocache: true, 
                    preventimages: true,
                    post: true,
                    data: {
                        action: "manga_get_chapters",
                        manga: mangaVar.manga_id
                    }
                })
            }
    
            var res = []
            $(this.options.chapters_a_sel, doc).each(function (index) {
                res.push([
                    $(this).text().replace(mangaName, "").trim(),
                    self.makeChapterUrl($(this).attr("href")) // add ?style=list to load chapter in long strip mode, remove it if it already there and add it again,
                ])
            })
            console.log(res)
    
            return res
        },
    
        getInformationsFromCurrentPage: async function (doc, curUrl) {
            let url = new URL(curUrl);
            let path = url.pathname;
            let pathSplitted = path.split('/').filter(p => p != '');
            let mangaPath = pathSplitted.slice(0, 2);
            let mangaurl = url.origin + '/' + mangaPath.join('/') + '/';
            let mgname;
            if ($(`a[href="${mangaurl}"]`, doc).length > 0) {
                mgname = $(`a[href="${mangaurl}"]`, doc).first().text().trim();
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
        },
    
        getListImages: async function (doc, curUrl) {
            res = [];
            let self = this;
            
            let preloadImages = await amr.getVariable('chapter_preloaded_images', doc);
            if (preloadImages !== this.undefined) {
                preloadImages = Object.values(preloadImages)
                return preloadImages;
            }
            console.log(this.options)
            $(this.options.img_sel, doc).each(function (index) {
                let img = $(this).attr(self.options.img_src)
                if (img === undefined) {
                    img = $(this).attr(self.options.secondary_img_src)
                }
                res.push(img)
            });
            return res;
        },
    
        getImageFromPageAndWrite: async function (urlImg, image) {
            $(image).attr("src", urlImg)
        },
    
        isCurrentPageAChapterPage: function (doc, curUrl) {
            return $(this.options.page_container_sel, doc).length > 0
        },
    
        makeChapterUrl: function (url) {
            return this.stripLastSlash(url.replace("?style=list", "").replace("?style=paged", "")) + "?style=list"
        },
    
        stripLastSlash: function(url) {
            if (url.substring(url.length - 1) == "/") {
                url = url.substring(0, url.length - 1);
            }
            return url
        }
    })
}