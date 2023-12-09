import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import SadScansIcon from "../icons/scantradunion-optimized.png"

export class SadScans extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Sad Scans"
    canListFullMangas = false
    mirrorIcon = SadScansIcon
    languages = "tr"
    domains = ["sadscans.com"]
    home = "https://sadscans.com/"
    chapter_url = /^\/reader\/.+$/g

    async getMangaList(search: string) {
        const _self = this
        const doc = await this.mirrorHelper.loadPage(this.home + "series?search=" + search, {
            nocache: true,
            preventimages: true
        })
        const res = []
        const $ = this.parseHtml(doc)
        $(".hover-image").each(function () {
            res.push([$("h2", this).text(), _self.home + $("a", this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $(".chap-section a").each(function (index) {
            res.push([$(this).attr("title").replace("Bölüm", "").trim(), _self.home + $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)

        var mgtitle = $($(".series-title")[0])
        return {
            name: mgtitle.text(),
            currentMangaURL: this.home + mgtitle.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const res = []
        const $ = this.parseHtml(doc)
        const id = curUrl.split("/")[4]
        const _self = this
        $(".swiper-wrapper .swiper-slide").each(function (index) {
            const hash = $(this).attr("data-hash")
            // let url = self.home + 'config.json?_cid=' + id + '&' + hash
            res.push(id + "|" + hash)
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, ".swiper-wrapper .swiper-slide").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        const parts = urlImage.split("|")
        const url = this.home + "config.json?_cid=" + parts[0] + "&" + parts[1]
        let img
        await fetch(url).then(blob => blob.json().then(dat => (img = "data:image/;base64," + dat[0])))

        return img
    }
}
