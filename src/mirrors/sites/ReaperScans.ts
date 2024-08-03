import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ReaperScansIcon from "../icons/reaperscans-optimized.png"
import { val } from "cheerio/lib/api/attributes"

export class ReaperScans extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Reaper Scans"
    canListFullMangas = false
    mirrorIcon = ReaperScansIcon
    languages = "en"
    domains = ["reaperscans.com", "reapercomics.com"]
    home = "https://reapercomics.com"
    apiBaseUrl = "https://api.reaperscans.com/"
    chapter_url = /^\/series\/.+\/chapter-.+/g

    async getMangaList(search: string) {
        return []
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        const $ = this.parseHtml(doc)

        const regex = /{\\\"series_id\\\":(\d+)}]/g
        const matches = regex.exec(doc)
        const seriesId = matches[1]

        const json = await this.mirrorHelper.loadJson(
            `${this.apiBaseUrl}chapter/query?page=1&perPage=1000&series_id=${seriesId}`
        )

        for (const chap of json.data) {
            if (chap.price == 0) {
                res.push([
                    chap.chapter_name +
                        (chap.chapter_title !== null && chap.chapter_title.length > 0
                            ? " - " + chap.chapter_title
                            : ""),
                    this.home + `/series/${chap.series.series_slug}/${chap.chapter_slug}`
                ])
            }
        }
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const mgtitle = $("h2.text-xxs")
        return {
            name: mgtitle.text(),
            currentMangaURL: curUrl.split("/", 5).join("/"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc) {
        const $ = this.parseHtml(doc)
        const res = []

        // Normal comics
        if ($(".container img[loading='lazy']").length > 0) {
            $(".container img[loading='lazy']").each(function (index) {
                res.push($(this).attr("src"))
            })
        }

        /*
        // This is going to be a test of making blob images for showing novels without needing to redo shit, but unlike comic chapters they do not send raw html for novels so I need to figure out how to parse it later and try again
        // Novel url for test: https://reaperscans.com/series/is-it-bad-that-the-main-characters-a-roleplayer
        if ($(".container div#reader-container").length > 0) {
            const promises = []
            $(".container div#reader-container p").each(function(index) {
                const e = $(this)
                const canvas = new OffscreenCanvas(1,1)
                const context = canvas.getContext('2d')
                
                context.rect(0, 0, 800, 100)
                context.fillStyle = "black"
                context.fill()

                context.font = "30px Helvetica"
                context.fillStyle = "ghostwhite"
                context.fillText(e.text().trim(), 10, 10)
                
                promises.push(canvas.convertToBlob())
            })

            await Promise.all(promises).then(vals => res.push(...vals))
        }
        */

        return res
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, ".container img[loading='lazy']").length > 0 /* || // Comics
            this.queryHtml(doc, ".container div#reader-container").length > 0 // Novels*/
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
