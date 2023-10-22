import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import SeriMangaIcon from "../icons/serimanga-optimized.png"

export class SeriManga extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Seri Manga"
    canListFullMangas = true
    mirrorIcon = SeriMangaIcon
    languages = "tr"
    domains = ["serimanga.com"]
    home = "https://serimanga.com/"
    chapter_url = /^\/manga(s)?\/.*\/[0-9]+.+$/g

    async getMangaList(search: string) {
        const url = this.home + "mangalar"
        const res = this.getMangaListPage(url)
        return res
    }

    async getMangaListPage(url) {
        const doc = await this.mirrorHelper.loadPage(url, { nocache: true, preventimages: true })
        const $ = this.parseHtml(doc)
        const res = []
        const _self = this

        $("li.mangas-item a").each(function (index) {
            res.push([$(".mlb-name", $(this)).text().trim(), $(this).attr("href")])
        })

        if ($("ul.pagination").length && $('ul.pagination a[rel="next"]').length) {
            const nextPage = $($('ul.pagination a[rel="next"]')[0]).attr("href")
            res.push(...(await _self.getMangaListPage(nextPage)))
        }

        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, {
            nocache: true,
            preventimages: true
        })
        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("li.spl-list-item a").each(function (index) {
            res.push([$("span:first", $(this)).text().trim(), $(this).attr("href")])
        })

        if ($("ul.pagination").length && $('ul.pagination a[rel="next"]').length) {
            const nextPage = $($('ul.pagination a[rel="next"]')[0]).attr("href")
            res.push(...(await _self.getListChaps(nextPage)))
        }

        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const mg = $($("div.rtm-logo a:last")[0])
        const url = new URL(curUrl)
        return {
            name: mg.text().trim(),
            currentMangaURL: mg.attr("href"),
            currentChapterURL: url.origin + url.pathname
        }
    }

    async getListImages(doc, curUrl, sender) {
        const res = []
        const _self = this
        const $ = this.parseHtml(doc)
        $("div.reader-manga.chapter-pages img").each(function (index) {
            res.push($(this).attr("src") || $(this).attr("data-src"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        const $ = this.parseHtml(doc)
        return $("div.reader-manga.chapter-pages img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
