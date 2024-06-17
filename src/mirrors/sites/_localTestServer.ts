import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import Icon from "../icons/mangadex-optimized.png"

export class TestSite extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Test Site"
    canListFullMangas = false
    mirrorIcon = Icon
    languages = "en"
    domains = ["localhost:3456"]
    home = "http://localhost:3456"
    chapter_url = /^\/read\/\d\/\d/g

    async getMangaList(search: string) {
        let res = []
        const jsonResult = await this.mirrorHelper.loadJson(`${this.home}/list`, { nocache: true })
        res = jsonResult.series.map(e => [e.name, this.home + "/series/" + e.id])
        return res
    }

    async getListChaps(urlManga) {
        const jsonResult = await this.mirrorHelper.loadJson(urlManga, { nocache: true })

        let res = []

        res = jsonResult.chapters
            .map((e, i) => [`Chapter ${e}`, this.home + "/read/" + jsonResult.seriesId + "/" + i])
            .reverse()
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const jsonResult = await this.mirrorHelper.loadJson(curUrl, { nocache: true })

        return {
            name: jsonResult.name,
            currentMangaURL: this.home + "/series/" + jsonResult.seriesId,
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl) {
        const jsonResult = await this.mirrorHelper.loadJson(curUrl, { nocache: true })

        const res = jsonResult.images.map(e => this.home + "/public/pages/" + e)
        return res
    }

    isCurrentPageAChapterPage(doc) {
        return true
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
