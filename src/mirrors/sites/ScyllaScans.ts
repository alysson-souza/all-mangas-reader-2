import { BaseMirror } from "./abstract/BaseMirror"
import { InfoResult, MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ScyllaScansIcon from "../icons/serimanga-optimized.png"

export class ScyllaScans extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Scylla Scans"
    canListFullMangas = true
    mirrorIcon = ScyllaScansIcon
    languages = "en"
    domains = ["scyllascans.org", "scyllacomics.xyz"]
    home = "https://scyllacomics.xyz/"
    chapter_url = /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/

    private async getMangaListFromPage(search: string, page: number | string, res: InfoResult[] = []) {
        const searchParams = new URLSearchParams()
        searchParams.set("title", search)
        if (page) {
            searchParams.set("page", String(page))
        }
        const urlManga = this.home + "manga?" + searchParams.toString()
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const $ = this.parseHtml(doc)
        $("main #card-real a").each(function () {
            res.push([$("h2", this).first().text(), $(this).attr("href")])
        })

        const nextPageLink = $(".pagination .pagination-link").last()
        if (nextPageLink.length <= 0 || nextPageLink.hasClass("pagination-disabled")) {
            return res
        }

        // onclick="window.location.href='http://scyllacomics.xyz/manga?page=2'"
        const s = nextPageLink.attr("onclick")
        const nextPage = s.match(/page=(\d+)/)[1]
        if (Number(nextPage) > 1) {
            return this.getMangaListFromPage(urlManga, nextPage, res)
        }

        return res
    }

    async getMangaList(search: string) {
        return this.getMangaListFromPage(search, 0, [])
    }

    async getListChaps(urlManga: string) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        const $ = this.parseHtml(doc)
        $("#chapters-list > a").each(function () {
            res.push([$("span", this).first().text(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        return {
            name: $("main > section h3 a").first().text(),
            currentMangaURL: $("main > section > span > a").attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const $ = this.parseHtml(doc)
        const res = []
        $("#chapter-container img").each(function () {
            res.push($(this).attr("data-src"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        const pathname = new URL(curUrl).pathname
        return this.chapter_url.test(pathname)
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
