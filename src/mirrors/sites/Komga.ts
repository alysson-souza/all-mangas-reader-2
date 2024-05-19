import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import KomgaIcon from "../icons/komga-optimized.png"

export class Komga extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Komga"
    canListFullMangas = false
    mirrorIcon = KomgaIcon
    languages = "en"
    domains = ["komga"]
    home = "komga"
    chapter_url = /\/book\/.*?\/read.*/g

    async getMangaList(search: string) {
        const list = await this.apiCall(`./series?search=${search}`)

        return list.content.map(res => {
            return [res.name, this.komgaUrl(`./series/${res.id}`)]
        })
    }

    async getListChaps(urlManga) {
        const id = urlManga.split("/").pop()
        const res = []

        for (let page = 0, run = true; run; page++) {
            const list = await this.apiCall(
                `./series/${id}/books?page=${page}&size=500&sort=metadata.numberSort%2Cdesc`
            )
            const mangas = list.content.map(chap => {
                return [chap.name, this.komgaUrl(`./book/${chap.id}/read`)]
            })
            res.push(...mangas)

            if (list.last) {
                run = false
            }
        }
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const parts = new URL(curUrl).pathname.split("/")
        const id = parts[parts.length - 2]
        const manga = await this.apiCall(`./books/${id}`)
        const series = await this.apiCall(`./series/${manga.seriesId}`)

        return {
            name: series.name,
            currentMangaURL: this.komgaUrl(`./series/${series.id}`),
            currentChapterURL: this.komgaUrl(`./book/${id}/read`)
        }
    }

    async getListImages(doc, curUrl) {
        const parts = new URL(curUrl).pathname.split("/")
        const id = parts[parts.length - 2]
        const pages = await this.apiCall(`./books/${id}/pages`)

        return pages.map(page => this.apiUrl(`./books/${id}/pages/${page.number}`))
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return new URL(curUrl).pathname.split("/").pop().includes("read")
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }

    komgaUrl(path: string): string {
        return new URL(path, new URL(this.mirrorHelper.getOption("komgaUrl").toString()).href).toString()
    }

    apiUrl(path: string): string {
        return new URL(path, this.komgaUrl("./api/v1/")).toString()
    }

    async apiCall(url: string) {
        const options = {
            headers: {
                Authorization: `Basic ${btoa(
                    `${this.mirrorHelper.getOption("komgaUser")}:${this.mirrorHelper.getOption("komgaPassword")}`
                )}`
            }
        }

        return await this.mirrorHelper.loadJson(this.apiUrl(`./${url}`), options)
    }
}
