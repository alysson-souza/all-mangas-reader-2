import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import DisasterScansIcon from "../icons/disasterscans-optimized.png"

export class DisasterScans extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Disaster Scans"
    canListFullMangas = true
    mirrorIcon = DisasterScansIcon
    languages = "en"
    domains = ["disasterscans.com"]
    home = "https://disasterscans.com"
    chapter_url = /^\/.*\/.*\/.*-chapter-.*/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(this.home + "/comics", {
            nocache: true,
            preventimages: true
        })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("a[href*='/comics/']").each(function () {
            res.push([$(this).text(), _self.home + $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []

        const regex = /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/g
        const matches = regex.exec(doc)
        const data = JSON.parse(matches[1])

        data.props.pageProps.chapters.forEach(elem =>
            res.push([
                ("Chapter " + elem.chapterNumber + (elem.ChapterName != "" ? " - " + elem.ChapterName : "")).trim(),
                urlManga + "/" + elem.chapterID + "-chapter-" + elem.chapterNumber
            ])
        )
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        return {
            name: $('h1[class*="chapter_comicName"]').text().trim(),
            currentMangaURL: curUrl.split("/").slice(0, 5).join("/"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc) {
        const $ = this.parseHtml(doc)
        const res = []
        $("img[alt='00']").each(function () {
            res.push($(this).attr("src"))
        })

        return res
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, "img[alt='00']").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
