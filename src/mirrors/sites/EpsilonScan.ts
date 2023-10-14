import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import EpsilonScanIcon from "../icons/epsilonscan-optimized.png"

export class EpsilonScan extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Epsilon Scan"
    canListFullMangas = false
    mirrorIcon = EpsilonScanIcon
    languages = "fr"
    domains = ["epsilonscan.fr"]
    home = "https://epsilonscan.fr"
    chapter_url = /\/(?!manga).+\//g

    async getMangaList(search: string) {
        let res = []
        let jsonResult = await this.mirrorHelper.loadJson(`${this.home}/wp-admin/admin-ajax.php`, {
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
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        let res = []
        let _self = this
        const $ = this.parseHtml(doc)

        $("div#chapterlist li a").each(function (index) {
            let chapUrl = $(this).attr("href")
            let chapTitle = $("span.chapternum", this).text()
            res.push([chapTitle, chapUrl])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        let serieLink = $("div.allc a")
        return {
            name: serieLink.text().trim().replace("’", "'"),
            currentMangaURL: serieLink.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc) {
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

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, "div.chapterbody").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
