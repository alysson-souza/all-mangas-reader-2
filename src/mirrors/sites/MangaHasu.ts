import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaHasuIcon from "../icons/mangahasu-optimized.png"

export class MangaHasu extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga Hasu"
    canListFullMangas = false
    mirrorIcon = MangaHasuIcon
    languages = "en"
    domains = ["mangahasu.se", "mangahasu.me"]
    home = "https://mangahasu.me/"
    chapter_url = /^\/.+\/chapter.+\.html/g

    async getMangaList(search: string) {
        const url = this.home + "advanced-search.html?keyword=" + search

        const res = await this.getMangaListPage(url)

        return res
    }

    async getMangaListPage(url: string) {
        const doc = await this.mirrorHelper.loadPage(url, { nocache: true, preventimages: true })

        let res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $(".list_manga a.name-manga").each(function () {
            res.push([$(this).text().trim(), $(this).attr("href")])
        })

        const nextPage = $(".pagination-ct a:contains('Next →')")
        if (nextPage.length > 0) {
            // Has pages
            res = [...res, ...(await _self.getMangaListPage(_self.home + nextPage.attr("href")))]
        }

        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $(".list-chapter td.name a").each(function (index) {
            $(this).find("span").remove()
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        var mgtitle = $(".content .div-breadcrumb a:last")
        return {
            name: mgtitle.text().trim(),
            currentMangaURL: mgtitle.attr("href"),
            currentChapterURL: curUrl.split(".html")[0] + ".html"
        }
    }

    async getListImages(doc) {
        const $ = this.parseHtml(doc)
        const res = []

        $(".img-chapter img").each(function (index) {
            res.push($(this).attr("src"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, ".img-chapter img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
