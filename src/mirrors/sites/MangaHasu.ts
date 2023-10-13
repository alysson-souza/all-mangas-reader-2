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
    domains = ["mangahasu.se"]
    home = "https://mangahasu.se/"
    chapter_url = /^\/.+\/chapter.+\.html/g

    async getMangaList(search: string) {
        let url = this.home + "advanced-search.html?keyword=" + search

        let res = await this.getMangaListPage(url)

        return res
    }

    async getMangaListPage(url: string) {
        let doc = await this.mirrorHelper.loadPage(url, { nocache: true, preventimages: true })

        let res = []
        let _self = this
        const $ = this.parseHtml(doc)

        $(".list_manga a.name-manga").each(function () {
            res.push([$(this).text().trim(), $(this).attr("href")])
        })

        let nextPage = $(".pagination-ct a:contains('Next →')")
        if (nextPage.length > 0) {
            // Has pages
            res = [...res, ...(await _self.getMangaListPage(_self.home + nextPage.attr("href")))]
        }

        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        let res = []
        let _self = this
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
        let res = []

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
