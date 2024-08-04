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
    home = "https://reaperscans.com"
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

        /*
        https://reapercomics.com/series/seoul-station-necromancer/chapter-141
        https://reaperscans.com/series/seoul-station-necromancer/chapter-142

        */

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

    async getListImages(doc, curUrl) {
        // https://reaperscans.com/series/swordmasters-youngest-son/chapter-123
        // https://api.reaperscans.com/chapter/swordmasters-youngest-son/chapter-123

        let res = []

        const url = this.apiBaseUrl + new URL(curUrl).pathname.replace("/series/", "chapter/")

        const json = await this.mirrorHelper.loadJson(url)

        if (json.chapter.chapter_type == "Comic") {
            res = json.chapter.chapter_data.images
        }

        if (json.chapter.chapter_type == "Novel") {
            const $ = this.parseHtml(json.chapter.chapter_content)

            const lines = []
            const lineLengthBeforeWrap = 140 // Number of characters to split the lines up for
            const wrap = (s, w) => s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, "g"), "$1:|:")

            for (const elem of $("p")) {
                const line = $(elem).text().trim()

                // console.debug('Line', line.length, line)

                if (line.length > lineLengthBeforeWrap) {
                    const parts = wrap(line, lineLengthBeforeWrap).split(":|:")
                    // console.debug('Line Wrap detected', line, parts)

                    lines.push(...parts)
                } else {
                    lines.push(line)
                }
            }

            for (const line of lines) {
                res.push(await this.createImageFromText(line))
            }
        }

        return res
    }

    async createImageFromText(text) {
        const height = 32
        const canvas = new OffscreenCanvas(1000, height)
        const context = canvas.getContext("2d")

        context.rect(0, 0, 1000, height)
        context.fillStyle = "black"
        context.fill()

        context.font = "15px Helvetica"
        context.fillStyle = "ghostwhite"
        context.fillText(text, 7, height - 7)

        const blob = await canvas.convertToBlob()
        const base64String = await new Promise(resolve => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
        })

        return base64String
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, ".container img[loading='lazy']").length > 0 /* || // Comics
            this.queryHtml(doc, ".container div#reader-container").length > 0 // Novels*/
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
