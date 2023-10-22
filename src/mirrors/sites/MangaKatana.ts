import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaKatanaIcon from "../icons/mangakatana-optimized.png"

export class MangaKatana extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga Katana"
    canListFullMangas = false
    mirrorIcon = MangaKatanaIcon
    languages = "en"
    domains = ["mangakatana.com"]
    home = "https://mangakatana.com"
    chapter_url = /\/manga\/.*\/(c|v)/g

    async getMangaList(search: string) {
        const url = this.home + "/?search=" + search + "&search_by=book_name"

        const res = await this.getMangaListPage(url)

        return res
    }

    async getMangaListPage(url: string) {
        const doc = await this.mirrorHelper.loadPage(url, { nocache: true, preventimages: true })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("#book_list h3 a").each(function (index) {
            res.push([$(this).text(), $(this).attr("href")])
        })

        if ($("ul.uk-pagination").length && $("ul.uk-pagination a.next").length) {
            const nextPage = $($("ul.uk-pagination a.next")[0]).attr("href")
            res.push(...(await _self.getMangaListPage(nextPage)))
        }

        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("td .chapter a").each(function (index) {
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const mg = $("#breadcrumb_wrap a:last")
        return {
            name: mg.text(),
            currentMangaURL: mg.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc) {
        const a = doc.match(/thzq=\[.+?\];/g)[0]
        const b = a.replace("thzq=[", "[").replace(",];", "]").replace(/'/g, '"')
        const res = JSON.parse(b)
        return res
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, "#imgs img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
