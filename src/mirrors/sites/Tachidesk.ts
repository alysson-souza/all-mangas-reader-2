import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import TachideskIcon from "../icons/tachidesk-optimized.png"

export class Tachidesk extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Tachidesk"
    canListFullMangas = true
    mirrorIcon = TachideskIcon
    languages = "en"
    domains = ["tachidesk"]
    home = "tachidesk"
    chapter_url = /\/manga\/\d+\/chapter\/\d+/g

    apiUrl() {
        return new URL("/api/v1/", new URL(String(this.mirrorHelper.getOption("tachideskUrl"))).href)
    }

    async getMangaList(search: string) {
        let categories = await this.mirrorHelper.loadJson(this.apiUrl() + "category")

        return Object.assign(
            {},
            ...(await Promise.all(
                categories.map(async ele => {
                    let data = await this.mirrorHelper.loadJson(this.apiUrl() + "category/" + ele.id)
                    return data.map(elem => {
                        return [
                            elem.title,
                            new URL("manga/" + elem.id, String(this.mirrorHelper.getOption("tachideskUrl"))).href
                        ]
                    })
                })
            ))
        )
    }

    async getListChaps(urlManga) {
        let id = urlManga
            .split("/")
            .filter(ele => ele != "")
            .slice(-1)[0]
        let data
        try {
            data = await this.mirrorHelper.loadJson(this.apiUrl() + "manga/" + id + "/chapters?onlineFetch=true")
        } catch (e) {
            console.warn("tachidesk onlineFetch failed for id:" + id + " manga, trying onlineFetch=false")
            data = await this.mirrorHelper.loadJson(this.apiUrl() + "manga/" + id + "/chapters?onlineFetch=false")
        }
        return data.map(ele => {
            return [
                ele.name,
                new URL("manga/" + id + "/chapter/" + ele.index, String(this.mirrorHelper.getOption("tachideskUrl")))
                    .href
            ]
        })
    }

    async getCurrentPageInfo(doc, curUrl) {
        let id = curUrl
            .split("/")
            .filter(ele => ele != "")
            .slice(-3)[0]
        let chapid = curUrl
            .split("/")
            .filter(ele => ele != "")
            .slice(-1)[0]

        let manga = await this.mirrorHelper.loadJson(this.apiUrl() + "manga/" + id)
        return {
            name: manga.title,
            currentMangaURL: new URL("manga/" + id, String(this.mirrorHelper.getOption("tachideskUrl"))).href,
            currentChapterURL: new URL(
                "manga/" + id + "/chapter/" + chapid,
                String(this.mirrorHelper.getOption("tachideskUrl"))
            ).href
        }
    }

    async getListImages(doc, curUrl, sender) {
        let id = curUrl
            .split("/")
            .filter(ele => ele != "")
            .slice(-3)[0]
        let chapid = curUrl
            .split("/")
            .filter(ele => ele != "")
            .slice(-1)[0]

        let chapdat = await this.mirrorHelper.loadJson(this.apiUrl() + "manga/" + id + "/chapter/" + chapid)

        return Array(chapdat.pageCount)
            .fill(0)
            .map((_, pageNumber) => {
                return this.apiUrl() + "manga/" + id + "/chapter/" + chapid + "/page/" + pageNumber + "?useCache=true"
            })
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        let isPage =
            curUrl
                .split("/")
                .filter(ele => ele != "")
                .slice(-2)[0] == "chapter" ||
            curUrl
                .split("/")
                .filter(ele => ele != "")
                .slice(-4)[0] == "chapter"

        return isPage
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
