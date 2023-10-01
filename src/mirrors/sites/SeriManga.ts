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
        let url = this.home + "mangalar"
        let res = this.getMangaListPage(url)
        return res
    }

    async getMangaListPage(url) {
        let doc = await this.mirrorHelper.loadPage(url, { nocache: true, preventimages: true })
        const $ = this.parseHtml(doc)
        let res = []
        let self = this

        $("li.mangas-item a").each(function (index) {
            res.push([$(".mlb-name", $(this)).text().trim(), $(this).attr("href")])
        })

        if ($("ul.pagination").length && $('ul.pagination a[rel="next"]').length) {
            let nextPage = $($('ul.pagination a[rel="next"]')[0]).attr("href")
            res.push(...(await self.getMangaListPage(nextPage)))
        }

        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, {
            nocache: true,
            preventimages: true
        })
        let res = []
        let self = this
        const $ = this.parseHtml(doc)

        $("li.spl-list-item a").each(function (index) {
            res.push([$("span:first", $(this)).text().trim(), $(this).attr("href")])
        })

        if ($("ul.pagination").length && $('ul.pagination a[rel="next"]').length) {
            let nextPage = $($('ul.pagination a[rel="next"]')[0]).attr("href")
            res.push(...(await self.getListChaps(nextPage)))
        }

        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        let mg = $($("div.rtm-logo a:last")[0])
        let url = new URL(curUrl)
        return {
            name: mg.text().trim(),
            currentMangaURL: mg.attr("href"),
            currentChapterURL: url.origin + url.pathname
        }
    }

    async getListImages(doc, curUrl, sender) {
        let res = []
        let self = this
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
