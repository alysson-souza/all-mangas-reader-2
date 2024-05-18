import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import LikeMangaIcon from "../icons/like-manga-optimized.png"

export class LikeManga extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Like Manga"
    canListFullMangas = false
    mirrorIcon = LikeMangaIcon
    languages = "en"
    domains = ["likemanga.io"]
    home = "https://likemanga.io"
    chapter_url = /^\/.*\/chapter-\d.+/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(
            this.home + "/?act=search&f[status]=all&f[sortby]=lastest-chap&f[keyword]=" + search,
            {
                nocache: true,
                preventimages: true
            }
        )

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("p.title-manga a").each(function () {
            res.push([$(this).text(), _self.home + $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("li.wp-manga-chapter a").each(function (index) {
            res.push([$(this).text().trim(), _self.home + $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        var mgtitle = $("h1#title-detail-manga a")

        return {
            name: mgtitle.text(),
            currentMangaURL: this.home + mgtitle.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const res = []
        const $ = this.parseHtml(doc)

        $(".page-chapter img").each(function (index) {
            res.push($(this).attr("src"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, ".page-chapter img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
