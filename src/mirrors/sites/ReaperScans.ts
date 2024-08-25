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
        const json = await this.mirrorHelper.loadJson(`${this.apiBaseUrl}query?adult=true&query_string=${search}`)
        const res = []

        for (const series of json.data) {
            res.push([series.title.trim(), `${this.home}/series/${series.series_slug}`])
        }

        return res
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

        /*
        https://media.reaperscans.com/file/4SRBHm//comics/ba81b4c2-9c66-4943-8b77-f1c9f503384e/chapters/b1e613a5-18f2-4f03-a3cb-cad1eba385bf/000 ars copia.jpg
                                                  comics/ba81b4c2-9c66-4943-8b77-f1c9f503384e/chapters/b1e613a5-18f2-4f03-a3cb-cad1eba385bf/000 ars copia.jpg
        */

        const res = []

        const url = this.apiBaseUrl + new URL(curUrl).pathname.replace("/series/", "chapter/")

        const json = await this.mirrorHelper.loadJson(url)
        const uniqueImages = []

        if (json.chapter.chapter_type == "Comic") {
            for (let image of json.chapter.chapter_data.images) {
                let imageName = image.split("/").pop().split(".")[0]
                if (imageName.endsWith("f")) {
                    imageName = imageName.substring(0, imageName.length - 1)
                }

                if (uniqueImages.includes(imageName)) {
                    continue
                }
                uniqueImages.push(imageName)

                if (!image.startsWith("https")) {
                    image = "https://media.reaperscans.com/file/4SRBHm/" + image
                }
                res.push(image)
            }
            console.debug(res)
        }

        if (json.chapter.chapter_type == "Novel") {
            const $ = this.parseHtml(json.chapter.chapter_content)

            const lines = []
            for (const elem of $("p")) {
                lines.push($(elem).text().trim())
            }

            res.push(...(await this.mirrorHelper.createImagesFromText(lines)))
        }

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
