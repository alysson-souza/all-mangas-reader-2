import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import NiceoppaiIcon from "../icons/niceoppai-optimized.png"

export class Niceoppai extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Niceoppai"
    canListFullMangas = false
    mirrorIcon = NiceoppaiIcon
    languages = "en"
    domains = ["niceoppai.net"]
    home = "http://www.niceoppai.net/"
    chapter_url = /\/.+\/\d+/g

    async getMangaList(search: string) {
        let doc = await this.mirrorHelper.loadPage("http://www.niceoppai.net/manga_list/search/", {
            nocache: true,
            preventimages: true,
            post: true,
            data: {
                cmd_wpm_wgt_mng_sch_sbm: "Search",
                txt_wpm_wgt_mng_sch_nme: search,
                cmd_search: "Go"
            }
        })

        let res = []
        const $ = this.parseHtml(doc)

        $("div > div > div > div.det > a").each(function (index) {
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, {
            nocache: true,
            preventimages: true
        })

        let res = []
        const $ = this.parseHtml(doc)

        $("div > div.wpm_pag.mng_det > ul > li > a").each(function () {
            let url = $(this).attr("href")
            let chap = url.split("/")[4]
            res.push([chap, url])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        let mga = $("div.wpm_pag.mng_rdr > h1 > a")
        return {
            name: mga.text().trim(),
            currentMangaURL: mga.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        let res = []
        const $ = this.parseHtml(doc)

        $("#image-container > center > img").each(function () {
            res.push($(this).attr("src"))
        })

        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "div.wpm_pag.mng_rdr > h1 > a").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
