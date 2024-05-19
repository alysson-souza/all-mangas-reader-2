import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ReaperScansIcon from "../icons/reaperscans-optimized.png"

export class ReaperScans extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Reaper Scans"
    canListFullMangas = false
    mirrorIcon = ReaperScansIcon
    languages = "en"
    domains = ["reaperscans.com", "reapercomics.com"]
    home = "https://reapercomics.com"
    chapter_url = /^\/comics\/.+\/chapters\/.+chapter/g

    async getMangaList(search: string) {
        return []
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        const $ = this.parseHtml(doc)

        $("li a[href*='/chapters/']").each(function (index) {
            res.push([$("p:first", this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const mgtitle = $($("main p:first")[0])
        return {
            name: mgtitle.text(),
            currentMangaURL: curUrl.split("/", 5).join("/"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc) {
        const $ = this.parseHtml(doc)
        const res = []
        $("main img").each(function (index) {
            res.push($(this).attr("src"))
        })

        return res
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, "main img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
