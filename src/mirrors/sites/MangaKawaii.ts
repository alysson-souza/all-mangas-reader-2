import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaKawaiiIcon from "../icons/mangakawaii-optimized.png"

export class MangaKawaii extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "MangaKawaii"
    canListFullMangas = false
    mirrorIcon = MangaKawaiiIcon
    languages = "fr"
    domains = ["mangakawaii.io"]
    home = "https://www.mangakawaii.io"
    chapter_url = /\/manga\/.*\/.*\/?.*$/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(`${this.home}/search?query=${search}&search_type=manga`, {
            nocache: true,
            preventimages: true
        })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("li h4 a").each(function () {
            res.push([$(this).text(), _self.home + $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $(".table__chapter a").each((idx, link) => {
            // +1 is here to handle the history.pushstate
            res.push([$(link).text(), _self.home + $(link).attr("href") + "/1"])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        // we don't use this link because the title can be truncated
        const serieLink = this.queryHtml(doc, "h1 a").attr("href")
        const mangaPage = await this.mirrorHelper.loadPage(this.home + serieLink, { preventimages: true })
        const mangaTitle = this.queryHtml(mangaPage, "h1").text()
        return {
            name: mangaTitle,
            currentMangaURL: this.home + serieLink,
            currentChapterURL: curUrl.endsWith("/1") ? curUrl : curUrl + "/1"
        }
    }

    async getListImages(doc) {
        const res = []

        const pages = this.mirrorHelper.getVariableFromScript("pages", doc),
            oeuvre_slug = this.mirrorHelper.getVariableFromScript("oeuvre_slug", doc),
            chapter_slug = this.mirrorHelper.getVariableFromScript("chapter_slug", doc),
            applocale = this.mirrorHelper.getVariableFromScript("applocale", doc),
            chapter_server = this.mirrorHelper.getVariableFromScript("chapter_server", doc)
        const cdnUrl = `https://${chapter_server}.mangakawaii.io`

        for (const page of pages) {
            res.push(
                `${cdnUrl}/uploads/manga/${oeuvre_slug}/chapters_${applocale}/${chapter_slug}/${page.page_image}?${page.page_version}`
            )
        }
        return res
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, "select#page-list").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
