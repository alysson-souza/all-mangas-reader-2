import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import LugnicaScanIcon from "../icons/lugnicascan-optimized.png"

export class LugnicaScan extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Lugnica Scan"
    canListFullMangas = true
    mirrorIcon = LugnicaScanIcon
    languages = "fr"
    domains = ["lugnica-scans.com"]
    home = "https://lugnica-scans.com/"
    chapter_url = /\/manga\/.*\/.*\/?$/g

    async getMangaList(search: string) {
        const catalog = await this.mirrorHelper.loadJson(`${this.home}api/get/catalog?page=0&filter=all`)
        const searchRegExp = new RegExp(`${search}`, "i")
        const _self = this
        const res = []
        catalog
            .filter(entry => {
                return searchRegExp.test(entry.title)
            })
            .forEach(function (e) {
                res.push([e.title, `${_self.home}manga/${e.slug}`])
            })
        return res
    }

    async getListChaps(urlManga) {
        const slug = urlManga.split("/")[4]
        const mangaObject = await this.mirrorHelper.loadJson(`${this.home}api/get/card/${slug}`)
        const chapters = mangaObject.chapters
        let res = []
        for (const volume in chapters) {
            res = res.concat(chapters[volume])
        }
        // sort by id chapter, this better than chapter
        res.sort((elem1, elem2) => elem2.id - elem1.id)
        const _self = this
        res = res.map(elem => [
            `Chapitre ${elem.chapter}`,
            `${_self.home}manga/${mangaObject.manga.slug}/${elem.chapter}`
        ])

        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const slug = curUrl.split("/")[4]
        const mangaInfo = await this.mirrorHelper.loadJson(`${this.home}api/get/card/${slug}`)
        return {
            name: mangaInfo.manga.title,
            currentMangaURL: `${this.home}manga/${mangaInfo.manga.slug}`,
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl) {
        const slug = curUrl.split("/")[4]
        const chapter = curUrl.split("/")[5]
        const mangaInfo = await this.mirrorHelper.loadJson(`${this.home}api/get/chapter/${slug}/${chapter}`)
        return mangaInfo.chapter.files.map(
            file => `${this.home}upload/chapters/${mangaInfo.manga.id}/${chapter}/${file}`
        )
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.chapter_url.test(new URL(curUrl).pathname)
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
