import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaReaderToIcon from "../icons/manga-reader-to-optimized.png"

export class MangaReaderTo extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga Reader.to"
    canListFullMangas = false
    mirrorIcon = MangaReaderToIcon
    languages = "en"
    domains = ["mangareader.to"]
    home = "https://mangareader.to/home"
    baseUrl = "https://mangareader.to"
    chapter_url = /^\/read\/.*\/en\/chapter-\d+/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(this.baseUrl + "/search?keyword=" + search, {
            nocache: true,
            preventimages: true
        })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("h3.manga-name a").each(function () {
            res.push([$(this).text().trim(), _self.baseUrl + $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $('ul#en-chapters a[href*="/read/"]').each(function (index) {
            res.push([$("span.name", this).text(), _self.baseUrl + $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        var mgtitle = $("a.hr-manga")

        return {
            name: mgtitle.text().trim(),
            currentMangaURL: this.baseUrl + mgtitle.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const res = []
        let $ = this.parseHtml(doc)

        const id = $("div#wrapper").attr("data-reading-id")

        // https://mangareader.to/ajax/image/list/chap/844382?mode=vertical&quality=high&hozPageSize=1

        doc = await this.mirrorHelper.loadJson(
            `${this.baseUrl}/ajax/image/list/chap/${id}?mode=vertical&quality=high&hozPageSize=1`,
            { nocache: true }
        )
        $ = this.parseHtml(doc.html)

        $("div.iv-card").each(function (index) {
            res.push($(this).attr("data-url"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        const pathname = new URL(curUrl).pathname
        return this.chapter_url.test(pathname)
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
