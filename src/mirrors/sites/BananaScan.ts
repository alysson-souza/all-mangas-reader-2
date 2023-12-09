import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import BananaScanIcon from "../icons/epsilonscan-optimized.png"

export class BananaScan extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Banana Scan"
    canListFullMangas = false
    mirrorIcon = BananaScanIcon
    languages = "fr"
    domains = ["banana-scan.com"]
    home = "https://banana-scan.com"
    chapter_url = /\/.*?-[0-9]+.*\//g

    async getMangaList(search: string) {
        let res = []
        const jsonResult = await this.mirrorHelper.loadJson(`${this.home}/wp-admin/admin-ajax.php`, {
            nocache: true,
            post: true,
            headers: { "X-Requested-With": "XMLHttpRequest", "Content-type": "application/x-www-form-urlencoded" },
            data: {
                action: "ts_ac_do_search",
                ts_ac_query: search
            }
        })
        res = jsonResult.series[0].all.map(e => [e.post_title, e.post_link])
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("div#chapterlist li a").each(function (index) {
            const chapUrl = $(this).attr("href")
            const chapTitle = $("span.chapternum", this).text()
            res.push([chapTitle, chapUrl])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const serieLink = $("div.allc a")
        return {
            name: serieLink.text().trim().replace("’", "'"),
            currentMangaURL: serieLink.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc) {
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

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, "div.chapterbody").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
