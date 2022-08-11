import { BaseMirror } from "./BaseMirror"
import { MirrorHelper } from "../../MirrorHelper"
import { AbstractOptions, MirrorImplementation } from "../../../types/common"

interface DefaultOptions {
    search_a_sel: string
    chapters_a_sel: string
    page_container_sel: string
    img_sel: string
    path_length: number
    search_json: boolean
    chapter_list_ajax: boolean
    chapter_list_ajax_selctor: string
    chapter_list_ajax_selctor_type: string
    title_selector: string
    img_src: string
    secondary_img_src: string
    sort_chapters: boolean
    isekai_chapter_url: boolean
    urlProcessor: (url) => any
    doBefore: () => void
}

export abstract class Madara extends BaseMirror implements MirrorImplementation {
    default_options: DefaultOptions = {
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
        sort_chapters: false,
        isekai_chapter_url: false,
        urlProcessor: url => url,
        doBefore: () => {}
    }

    mirrorName = "Madara"
    canListFullMangas = false

    abstract mirrorIcon
    abstract languages
    abstract domains
    abstract home
    abstract chapter_url

    private options: DefaultOptions & AbstractOptions

    protected constructor(mirrorHelper: MirrorHelper, options: Partial<AbstractOptions>) {
        super(mirrorHelper)
        this.options = Object.assign(this.default_options, options)
    }

    async getMangaList(search) {
        const searchApiUrl = this.options.search_url + "wp-admin/admin-ajax.php"
        const res = []

        if (this.options.search_json) {
            let json = await this.mirrorHelper.loadJson(searchApiUrl, {
                nocache: true,
                preventimages: true,
                post: true,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-type": "application/x-www-form-urlencoded"
                },
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
            const urlManga = this.options.search_url + "?s=" + search + "&post_type=wp-manga"
            const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
            const self = this

            const $ = this.parseHtml(doc)

            $(this.options.search_a_sel).each(function () {
                res[res.length] = [$(this).text(), self.options.urlProcessor($(this).attr("href"))]
            })
        }
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        let self = this

        let $ = this.parseHtml(doc)

        let mangaName = $(this.options.search_a_sel, doc).text().trim()

        if (this.options.chapter_list_ajax) {
            let searchApiUrl = this.options.search_url + "wp-admin/admin-ajax.php"
            let mangaVar

            if (this.options.isekai_chapter_url)
                searchApiUrl = (urlManga.endsWith("/") ? urlManga : urlManga + "/") + "ajax/chapters/"

            if (this.options.chapter_list_ajax_selctor_type == "variable") {
                mangaVar = this.getVariable({ variableName: this.options.chapter_list_ajax_selctor, doc }).manga_id
            } else {
                mangaVar = $(this.options.chapter_list_ajax_selctor).attr("data-id")
            }

            doc = await this.mirrorHelper.loadPage(searchApiUrl, {
                nocache: true,
                preventimages: true,
                post: true,
                data: {
                    action: "manga_get_chapters",
                    manga: mangaVar
                }
            })
        }

        $ = this.parseHtml(doc)

        var res = []
        $(this.options.chapters_a_sel).each(function () {
            let chapterName = $(this).text()
            let stringsToStrip = [mangaName, $(".chapter-release-date", this).text()]

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

    async getCurrentPageInfo(doc, curUrl) {
        let url = new URL(this.options.urlProcessor(curUrl))
        let path = url.pathname
        let pathSplitted = path.split("/").filter(p => p != "")
        let mangaPath = pathSplitted.slice(0, this.options.path_length)
        let mangaurl = url.origin + "/" + mangaPath.join("/") + "/"
        let mgname

        let $ = this.parseHtml(doc)

        const query = $(`a[href="${mangaurl}"]:not(:contains("Manga Info")):not(:contains("Novel Info"))`, doc)
        if (query.length > 0) {
            mgname = query.first().text().trim()
        }
        if (mgname === undefined || mgname.trim() === "") {
            const docmg = await this.mirrorHelper.loadPage(mangaurl)
            $ = this.parseHtml(docmg)
            mgname = $("div.post-title > h3").text().trim()
            if (mgname === undefined || mgname.trim() === "") {
                mgname = $(this.options.title_selector).text().trim()
            }
        }
        return {
            name: mgname,
            currentMangaURL: mangaurl,
            currentChapterURL: this.options.urlProcessor(this.makeChapterUrl(curUrl))
        }
    }

    async getListImages(doc, curUrl) {
        const res = []
        let self = this

        let preloadImages = await this.getVariable({ variableName: "chapter_preloaded_images", doc })
        if (preloadImages !== undefined) {
            return preloadImages
        }
        const $ = this.parseHtml(doc)
        $(this.options.img_sel).each(function () {
            let img = $(this).attr(self.options.img_src)
            if (self.options.hasOwnProperty("secondary_img_src") && img === undefined) {
                img = $(this).attr(self.options.secondary_img_src)
            }
            res.push(img)
        })
        return res
    }

    async getImageUrlFromPage(urlImg) {
        return urlImg
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, this.options.page_container_sel).length > 0
    }

    makeChapterUrl(url) {
        let t = new URL(url)
        return this.stripLastSlash(t.origin + t.pathname) + "?style=list"
    }

    stripLastSlash(url) {
        if (url.substring(url.length - 1) == "/") {
            url = url.substring(0, url.length - 1)
        }
        return url
    }
}
