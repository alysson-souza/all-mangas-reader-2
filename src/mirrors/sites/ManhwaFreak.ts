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

    async getMangaList(search: string) {
        let doc = await this.mirrorHelper.loadPage(this.home + "/manga/", { nocache: true, preventimages: true })

        let res = []
        const $ = this.parseHtml(doc)

        $("div.listupd div.lastest-title a").each(function (index) {
            res.push([$(this).attr("title").trim(), $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        let res = []
        const $ = this.parseHtml(doc)

        $("div.chapter-li a").each(function (index) {
            res.push([$("div.chapter-info p:first", this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        let bc = $("div.breadcrumb a")

        return {
            name: $(bc[1]).text().trim(),
            currentMangaURL: $(bc[1]).attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        let res = []
        let regex = /ts_reader\.run\((.*?)\);/g
        let parts = doc.match(regex)

        let json = JSON.parse(parts[0].replace("ts_reader.run(", "").replace(");", ""))

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
