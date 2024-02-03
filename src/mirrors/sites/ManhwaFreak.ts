import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ManhwaFreakIcon from "../icons/manhwa-freak-optimized.png"

export class ManhwaFreak extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manhwa Freak"
    canListFullMangas = true
    mirrorIcon = ManhwaFreakIcon
    languages = "en"
    domains = ["manhwa-freak.com", "manhwafreak.com"]
    home = "https://manhwa-freak.com"
    chapter_url = /\/.*?ch-[0-9]+.*\//g
    // regex for removing changing part from chapter URLs
    tidyChapterUrlRegex = /(.*ch-[0-9]+(?:-[0-9]+)*?)(\-\w{5,}){0,1}(\/.*)/

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(this.home + "/manga/", { nocache: true, preventimages: true })

        const res = []
        const $ = this.parseHtml(doc)

        $("div.listupd div.lastest-title a").each(function (index) {
            res.push([$(this).attr("title").trim(), $(this).attr("href")])
        })
        return res
    }

    tidyChapterUrl(chapUrl: string): string {
        const urlMatch = chapUrl.match(this.tidyChapterUrlRegex)
        return urlMatch[1] + urlMatch[3]
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const $ = this.parseHtml(doc)

        const tidyUrl = url => this.tidyChapterUrl(url)

        $("div.chapter-li a").each(function (index) {
            const url = tidyUrl($(this).attr("href"))
            res.push([$("div.chapter-info p:first", this).text().trim(), url])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const bc = $("div.breadcrumb a")

        return {
            name: $(bc[1]).text().trim(),
            currentMangaURL: $(bc[1]).attr("href"),
            currentChapterURL: this.tidyChapterUrl(curUrl)
        }
    }

    async getListImages(doc, curUrl, sender) {
        const res = []
        const regex = /ts_reader\.run\((.*?)\);/g
        const parts = doc.match(regex)

        const json = JSON.parse(parts[0].replace("ts_reader.run(", "").replace(");", ""))

        json.sources.forEach(source => {
            source.images.forEach(image => {
                res.push(image)
            })
        })

        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "div#readerarea").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
