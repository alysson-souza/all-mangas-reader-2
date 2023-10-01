import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ZaHardTopIcon from "../icons/zahardtop-optimized.png"

export class ZaHardTop extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Za Hard Top"
    canListFullMangas = false
    mirrorIcon = ZaHardTopIcon
    languages = "en"
    domains = ["zahard.xyz"]
    home = "https://zahard.xyz/"
    chapter_url = /^\/read\/.+\d/g

    async getMangaList(search: string) {
        let res = []
        let doc = await this.mirrorHelper.loadPage(this.home + "/library?search=" + search, {
            nocache: true,
            preventimages: true
        })

        const $ = this.parseHtml(doc)
        $(".listupd a").each(function () {
            res.push([$(this).text(), $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const $ = this.parseHtml(doc)
        let res = []
        let title = $("h1").text().trim()

        $("#chapterlist a").each(function (index) {
            res.push([$(this).text().replace(title, "").trim(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)

        let seriesUrl = $('.listupd a[href*="/manga/"]').attr("href")

        let doc2 = await this.mirrorHelper.loadPage(seriesUrl)
        const $$ = this.parseHtml(doc2)

        console.debug("ZA Hard Top", seriesUrl, $$("h1").text())

        return {
            name: $$("h1").text(),
            currentMangaURL: seriesUrl,
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        let res = []
        const $ = this.parseHtml(doc)
        $("#chapter_imgs img").each(function (index) {
            let src = $(this).attr("src")
            if (src) res.push(src.trim())
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml("#chapter_imgs img", doc).length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
