import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import Manhwa18comIcon from "../icons/manwha18-optimized.png"

export class Manhwa18com extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manhwa18.com"
    canListFullMangas = false
    mirrorIcon = Manhwa18comIcon
    languages = "en"
    domains = ["manhwa18.com"]
    home = "http://www.manhwa18.com/"
    chapter_url = /\/manga\/.*\/.*/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(this.home + "tim-kiem?q=" + search, {
            nocache: true,
            preventimages: true
        })

        const res = []
        const $ = this.parseHtml(doc)

        $(`.series-title a`).each(function (ind) {
            res.push([$(this).text(), $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const $ = this.parseHtml(doc)

        $(`ul.list-chapters a`).each(function (index) {
            res.push([
                $(".chapter-name", this)
                    .text()
                    .replace(/chapter|chap|ch/g, "")
                    .trim(),
                $(this).attr("href")
            ])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const link = $($("ul.breadcrumb li a")[2])
        const titlePage = await this.mirrorHelper.loadPage(link.attr("href"))
        const $$ = this.parseHtml(titlePage)

        return {
            name: $$(".series-name").text(),
            currentMangaURL: link.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const res = []
        const $ = this.parseHtml(doc)

        $(`div#chapter-content img`).each(function () {
            res.push($(this).attr("data-src"))
        })

        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "div#chapter-content img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
