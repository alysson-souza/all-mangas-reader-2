import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaBTTIcon from "../icons/manga-btt-optimized.png"

export class MangaBTT extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga BTT"
    canListFullMangas = false
    mirrorIcon = MangaBTTIcon
    languages = "en"
    domains = ["manhwabtt.com"]
    home = "https://manhwabtt.com"
    chapter_url = /^\/manga\/.+\/chapter-.+\/\d+$/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(this.home + "/find-story?keyword=" + search, {
            nocache: true,
            preventimages: true
        })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("figure figcaption h3 a").each(function () {
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const _self = this
        let $ = this.parseHtml(doc)

        const storyID = $("input#storyID").val().toString()
        const fd = new FormData()
        fd.append("StoryID", storyID)

        doc = await this.mirrorHelper.loadPage("https://manhwabtt.com/Story/ListChapterByStoryID", {
            nocache: true,
            preventimages: true,
            method: "POST",
            data: fd
        })
        $ = this.parseHtml(doc)

        $("div.chapter a").each(function (index) {
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        var mgtitle = $("h1 a")

        return {
            name: mgtitle.text(),
            currentMangaURL: mgtitle.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const res = []
        const $ = this.parseHtml(doc)

        $("div.reading-detail img").each(function (index) {
            const src = $(this).attr("src")
            if (src !== "https://image.mangabtt.com//Upload/Content/images/chapter/top.jpg") res.push(src)
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "div.reading-detail img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
