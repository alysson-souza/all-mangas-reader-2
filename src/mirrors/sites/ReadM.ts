import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ReadMIcon from "../icons/readm-optimized.png"

export class ReadM extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Read M"
    canListFullMangas = false
    mirrorIcon = ReadMIcon
    languages = "en"
    domains = ["readm.org", "readm.today"]
    home = "https://readm.today"
    chapter_url = /^\/manga\/.*\/.*/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(this.home + "/searchController/index?search=" + search, {
            nocache: true,
            preventimages: true
        })

        const res = []
        const $ = this.parseHtml(doc)

        $("ul.manga-list a").each((_, elem) => {
            res.push([$(elem).text().trim(), this.home + $(elem).attr("href")])
        })

        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, {
            nocache: true,
            preventimages: true
        })

        const res = []
        const $ = this.parseHtml(doc)
        $("#table-episodes-title > h6 > a").each((_, elem) => {
            const url = this.home + $(elem).attr("href")
            const chap = $(elem).text().trim()
            res.push([chap, url])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const mga = $("#router-view > div > div.ui.grid.mt-0 > div > h1 a")
        return {
            name: mga.text().trim(),
            currentMangaURL: this.home + mga.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const res = []
        const $ = this.parseHtml(doc)

        $("#router-view > div > div.ui.grid.chapter > div.ch-images.ch-image-container > center > img").each(
            (_, elem) => {
                res.push(this.home + $(elem).attr("src"))
            }
        )

        $("#router-view > div > div.ui.grid.chapter > div.ch-images.ch-image-container > center > a > img").each(
            (_, elem) => {
                res.push(this.home + $(elem).attr("src"))
            }
        )

        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        const $ = this.parseHtml(doc)
        return $("#router-view > div > div.ui.grid.mt-0 > div > h1").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
