import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ZeroScansIcon from "../icons/zeroscans-optimized.png"

export class ZeroScans extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Zero Scans"
    canListFullMangas = true
    mirrorIcon = ZeroScansIcon
    languages = "en"
    domains = ["zeroscans.com"]
    home = "https://zeroscans.com/"
    apiUrl = "https://zeroscans.com/swordflake/"
    chapter_url = /^\/comics\/.+\/\d/g

    async getMangaList(search: string) {
        let doc = await this.mirrorHelper.loadJson(this.apiUrl + "comics", {
            nocache: true
        })

        let res = doc.data.comics.map(comic => {
            return [comic.name, this.home + "comics/" + comic.slug]
        })

        return res
    }

    async getListChaps(urlManga) {
        let slug = urlManga.split("/")[4]
        let info = await this.mirrorHelper.loadJson(this.apiUrl + "comic/" + slug)

        let res = []

        for (let page = 1, run = true; run; page++) {
            let chapters = await this.getChaptersFromPage(info.data.id, page, slug)
            chapters.length > 0 ? res.push(...chapters) : (run = false)
        }
        return res
    }

    async getChaptersFromPage(id, page, slug) {
        let chapters = await this.mirrorHelper.loadJson(
            this.apiUrl + "comic/" + id + "/chapters?sort=desc&page=" + page
        )
        return chapters.data.data.map(chapter => {
            return [chapter.name, this.home + "comics/" + slug + "/" + chapter.id]
        })
    }

    async getCurrentPageInfo(doc, curUrl) {
        let slug = curUrl.split("/")[4]
        let info = await this.mirrorHelper.loadJson(this.apiUrl + "comic/" + slug)
        return {
            name: info.data.name,
            currentMangaURL: curUrl.split("/").slice(0, 5).join("/"),
            currentChapterURL: curUrl.split("?")[0]
        }
    }

    async getListImages(doc, curUrl, sender) {
        let parts = curUrl.split("/")
        let slug = parts[4]
        let chapterId = parts[5]

        let info = await this.mirrorHelper.loadJson(this.apiUrl + "comic/" + slug + "/chapters/" + chapterId)

        return info.data.chapter.high_quality
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return true // Dont remember why I just put true but whatever it works
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
