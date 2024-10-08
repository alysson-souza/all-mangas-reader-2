import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import FMTeamIcon from "../icons/fm-team-optimized.png"

export class FMTeam extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "FM Team"
    canListFullMangas = false
    mirrorIcon = FMTeamIcon
    languages = "fr"
    domains = ["fmteam.fr"]
    home = "http://fmteam.fr"
    chapter_url = /\/read\/.*\/ch\/\w+#?\d*/g

    async getMangaList(search: string) {
        const jsonSearch = await this.mirrorHelper.loadJson(`${this.home}/api/search/${search}`)
        const res = jsonSearch.comics.map(mangaJson => {
            return [mangaJson.title, this.home + mangaJson.url]
        })
        return res
    }

    async getListChaps(urlManga) {
        const id = urlManga.split("/")[4]
        //TODO: handle multi language, not used yet by the mrirror
        const jsonSearch = await this.mirrorHelper.loadJson(`${this.home}/api/comics/${id}`)
        const res = jsonSearch.comic.chapters.map(mangaJson => {
            return [mangaJson.full_title, this.home + mangaJson.url]
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const apiUrl = curUrl.replace("/read/", "/api/read/")
        const info = await this.mirrorHelper.loadJson(apiUrl)
        return {
            name: info.comic.title,
            currentMangaURL: this.home + info.comic.url,
            currentChapterURL: curUrl.includes("#") ? curUrl.split("#")[0] : curUrl
        }
    }

    async getListImages(doc, curUrl) {
        //https://fmteam.fr/read/one-punch-man/fr/ch/186
        const idManga = curUrl.split("/")[4]
        const idChap = curUrl.match(/ch\/(\w+)#?\d*$/)[1]
        //TODO handle language if needed

        // let jsonRes = await this.mirrorHelper.loadJson(`${this.home}/api/read/${idManga}/fr/ch/${idChap}`)

        const apiUrl = curUrl.replace("/read/", "/api/read/")
        const jsonRes = await this.mirrorHelper.loadJson(apiUrl)
        console.debug("FM Images", jsonRes)
        return jsonRes.chapter.pages
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return curUrl.match(/ch\/(\w+)#?\d*$/) !== undefined
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
