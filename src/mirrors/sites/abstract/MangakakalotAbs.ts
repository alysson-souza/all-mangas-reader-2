import { BaseMirror } from "./BaseMirror"
import { MirrorImplementation } from "../../../types/common"
import { MirrorHelper } from "../../MirrorHelper"
import { CheerioAPI } from "cheerio"

const defaultOptions = {
    base_url: "",
    search_url: "search/story/",
    series_list_selector: ".story_name a",
    series_list_page_last_selector: "a.page_last",
    chapter_list_selector: ".chapter-list a",
    chapter_information_selector: ".breadcrumb:first > p > :nth-child(3) a",
    images_selector: ".container-chapter-reader img"
}

export abstract class MangakakalotAbs extends BaseMirror implements MirrorImplementation {
    canListFullMangas = false
    abstract mirrorName
    abstract mirrorIcon
    abstract languages
    abstract domains
    abstract home
    abstract chapter_url

    private options: typeof defaultOptions

    protected constructor(mirrorHelper: MirrorHelper, options: Partial<typeof defaultOptions>) {
        super(mirrorHelper)
        this.options = { ...defaultOptions, ...options }
    }

    async getMangaList(search) {
        search = search.replace(/ /g, "_")
        let res = []
        let url = this.options.base_url + this.options.search_url + search
        let doc = await this.mirrorHelper.loadPage(url, { nocache: true, preventimages: true })

        const $ = this.parseHtml(doc)
        res.push(...this.searchPage($))

        const lastPage = $(this.options.series_list_page_last_selector)
        if (lastPage.length > 0) {
            const pageCount = parseInt(new URLSearchParams(new URL(lastPage.attr("href")).search).get("page")) || 2
            for (let i = 2; i <= pageCount; i++) {
                doc = await this.mirrorHelper.loadPage(url + "?page=" + i, { nocache: true, preventimages: true })
                res.push(...this.searchPage(this.parseHtml(doc)))
            }
        }

        return res
    }

    /** Receive parsed html, to a ovoid doing it multiple times **/
    searchPage($: CheerioAPI) {
        const self = this
        const res = []

        $(this.options.series_list_selector).each(function () {
            if (!$(this).attr("href").includes(self.options.base_url)) {
                // This is because multiple sites can be linked to each other
                return
            }
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        const $ = this.parseHtml(doc)

        $(this.options.chapter_list_selector).each(function (index) {
            res.push([$(this).text(), $(this).attr("href")])
        })

        return res
    }

    async getCurrentPageInfo(doc: string, curUrl: string) {
        const link = this.queryHtml(doc, this.options.chapter_information_selector)
        return {
            name: link.text(),
            currentMangaURL: link.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl) {
        const res = []
        const $ = this.parseHtml(doc)
        $(this.options.images_selector).each(function () {
            res.push($(this).attr("src"))
        })
        return res
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }

    isCurrentPageAChapterPage(doc: string, curUrl: string): boolean {
        return false
    }
}
