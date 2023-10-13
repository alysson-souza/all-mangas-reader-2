import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaPillIcon from "../icons/mangapill-optimized.png"

export class MangaPill extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga Pill"
    canListFullMangas = false
    mirrorIcon = MangaPillIcon
    languages = "en"
    domains = ["mangapill.com"]
    home = "https://mangapill.com"
    chapter_url = /^\/chapters\/.+$/g

    async getMangaList(search: string) {
        let doc = await this.mirrorHelper.loadPage(this.home + "/search?q=" + search + "&type=&status=", {
            nocache: true,
            preventimages: true
        })

        let res = []
        let _self = this
        const $ = this.parseHtml(doc)

        $(".mt-2 a").each(function () {
            res.push([$(this).text(), _self.home + $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        let res = []
        let _self = this
        const $ = this.parseHtml(doc)

        $('a[href*="/chapters/"]').each(function (index) {
            res.push([$(this).text(), _self.home + $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        let parts = curUrl.split("/")
        let id = parts[4].split("-")[0]
        let slug = parts[5].split("-chapter-")[0]
        let mgUrl = this.home + "/manga/" + id + "/" + slug

        doc = await this.mirrorHelper.loadPage(mgUrl, { nocache: true, preventimages: true })
        const $ = this.parseHtml(doc)
        var mgtitle = $("h1:first")

        return {
            name: mgtitle.text(),
            currentMangaURL: mgUrl,
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        let res = []
        const $ = this.parseHtml(doc)

        $("picture img").each(function (index) {
            res.push($(this).attr("data-src"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "picture img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
