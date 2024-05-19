import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import DynastyScansIcon from "../icons/dynastyscans-optimized.png"

export class DynastyScans extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Dynasty Scans"
    canListFullMangas = true
    mirrorIcon = DynastyScansIcon
    languages = "en"
    domains = ["dynasty-scans.com"]
    home = "https://dynasty-scans.com"
    chapter_url = /^\/chapters\/.+$/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(this.home + "/series", {
            nocache: true,
            preventimages: true
        })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $(".tag-list a").each(function () {
            res.push([$(this).text(), _self.home + $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $(".chapter-list a.name").each(function (index) {
            res[res.length] = [$(this).text(), _self.home + $(this).attr("href")]
        })
        res.reverse()
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const mgtitle = $($("#chapter-title a")[0])
        return {
            name: mgtitle.text(),
            currentMangaURL: this.home + mgtitle.attr("href"),
            currentChapterURL: curUrl.split("/").slice(0, 5).join("/")
        }
    }

    async getListImages(doc) {
        const pages = this.mirrorHelper.getVariableFromScript("pages", doc)

        return pages.map(page => this.home + page.image)
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, "#image img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
