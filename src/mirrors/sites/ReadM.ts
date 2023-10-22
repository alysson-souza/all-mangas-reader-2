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
    domains = ["readm.org"]
    home = "https://readm.org/"
    chapter_url = /^\/manga\/.*\/.*/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage("https://readm.org/searchController/index?search=" + search, {
            nocache: true,
            preventimages: true
        })

        const res = []
        const $ = this.parseHtml(doc)

        $("ul.manga-list a").each(function () {
            res.push([$(this).text().trim(), "https://readm.org" + $(this).attr("href")])
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
        $("#table-episodes-title > h6 > a").each(function () {
            const url = "https://readm.org" + $(this).attr("href")
            const chap = $(this).text().trim()
            res.push([chap, url])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const mga = $("#router-view > div > div.ui.grid.mt-0 > div > h1 a")
        return {
            name: mga.text().trim(),
            currentMangaURL: "https://readm.org" + mga.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const res = []
        const $ = this.parseHtml(doc)

        $("#router-view > div > div.ui.grid.chapter > div.ch-images.ch-image-container > center > img").each(
            function () {
                res.push("https://readm.org" + $(this).attr("src"))
            }
        )

        $("#router-view > div > div.ui.grid.chapter > div.ch-images.ch-image-container > center > a > img").each(
            function () {
                res.push("https://readm.org" + $(this).attr("src"))
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
