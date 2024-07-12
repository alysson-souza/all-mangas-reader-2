import { Madara, defaultOptions } from "./Madara"
import { MirrorHelper } from "../../MirrorHelper"
import { MirrorImplementation, MirrorObject } from "../../../types/common"

export class ManyToon extends Madara {
    constructor(mirrorHelper: MirrorHelper, mirror: MirrorObject, options: Partial<typeof defaultOptions> = {}) {
        super(mirrorHelper, mirror, options)
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const _self = this

        let $ = this.parseHtml(doc)

        const mangaName = $(this.options.search_a_sel).text().trim()
        const searchApiUrl = this.options.search_url + "wp-admin/admin-ajax.php"
        const mangaVar = $("#manga-chapters-holder").attr("data-id")

        doc = await this.mirrorHelper.loadPage(searchApiUrl, {
            nocache: true,
            preventimages: true,
            post: true,
            data: new URLSearchParams({
                action: "ajax_chap",
                post_id: mangaVar
            })
        })

        $ = this.parseHtml(doc)

        var res = []
        $(this.options.chapters_a_sel).each(function () {
            let chapterName = $(this).text()
            const stringsToStrip = [
                mangaName,
                $(".chapter-release-date", this).text(),
                $(".view", this).text(),
                $(".chapterdate", this).text()
            ]

            stringsToStrip.forEach(x => (chapterName = chapterName.replace(x, "")))

            if (chapterName !== "") {
                res.push([
                    chapterName.trim(),
                    _self.options.urlProcessor(_self.makeChapterUrl($(this).attr("href"))) // add ?style=list to load chapter in long strip mode, remove it if it already there and add it again,
                ])
            }
        })

        if (this.options.sort_chapters) {
            res.sort((a, b) => {
                const aM = a[0]
                    .replace(/chapter/gi, "")
                    .replace(/volume/gi, "")
                    .replace(/chap/gi, "")
                    .replace(/volume/gi, "")
                const bM = b[0]
                    .replace(/chapter/gi, "")
                    .replace(/volume/gi, "")
                    .replace(/chap/gi, "")
                    .replace(/volume/gi, "")
                if (aM && bM) {
                    return parseFloat(aM) > parseFloat(bM) ? -1 : 1
                }
                return 0
            })
        }

        return res
    }
}
