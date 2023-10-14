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
    languages = "en"
    domains = ["fmteam.fr"]
    home = "http://fmteam.fr"
    chapter_url = /\/read\/.*\/ch\/\w+#?\d*/g

    async getMangaList(search: string) {
        let jsonSearch = await this.mirrorHelper.loadJson(`${this.home}/api/search/${search}`)
        let res = jsonSearch.comics.map(mangaJson => {
            return [mangaJson.title, this.home + mangaJson.url]
        })
        return res
    }

    async getListChaps(urlManga) {
        const id = urlManga.split("/")[4]
        //TODO: handle multi language, not used yet by the mrirror
        let jsonSearch = await this.mirrorHelper.loadJson(`${this.home}/api/comics/${id}`)
        let res = jsonSearch.comic.chapters.map(mangaJson => {
            return [mangaJson.full_title, this.home + mangaJson.url]
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        let apiUrl = curUrl.replace("/read/", "/api/read/")
        let info = await this.mirrorHelper.loadJson(apiUrl)
        return {
            name: info.comic.title,
            currentMangaURL: this.home + info.comic.url,
            currentChapterURL: curUrl.includes("#") ? curUrl.split("#")[0] : curUrl
        }
    }

    async getListImages(doc, curUrl) {
        //https://fmteam.fr/read/one-punch-man/fr/ch/186
        let idManga = curUrl.split("/")[4]
        let idChap = curUrl.match(/ch\/(\w+)#?\d*$/)[1]
        //TODO handle language if needed

        // let jsonRes = await this.mirrorHelper.loadJson(`${this.home}/api/read/${idManga}/fr/ch/${idChap}`)

        let apiUrl = curUrl.replace("/read/", "/api/read/")
        let jsonRes = await this.mirrorHelper.loadJson(apiUrl)
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
