import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaFreakIcon from "../icons/mangafreak-optimized.png"

export class MangaFreak extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga-Freak"
    canListFullMangas = false
    mirrorIcon = MangaFreakIcon
    languages = "en"
    domains = [
        "w11.mangafreak.net",
        "w12.mangafreak.net",
        "w13.mangafreak.net",
        "w14.mangafreak.net",
        "w15.mangafreak.net"
    ]
    home = "https://w15.mangafreak.net"
    chapter_url = /\/Read.*/g

    async getMangaList(search: string) {
        let doc = await this.mirrorHelper.loadPage(this.home + "/Find/" + search, {
            nocache: true,
            preventimages: true
        })

        let res = []
        let _self = this
        const $ = this.parseHtml(doc)

        $(".manga_search_item h3 a").each(function (index) {
            res.push([$(this).text(), _self.home + $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        let res = []
        let _self = this
        const $ = this.parseHtml(doc)

        $(".manga_series_list tbody tr").each(function () {
            let elem = $(this).find("td:first a")
            res.push([elem.text(), _self.home + elem.attr("href")])
        })
        res.reverse()
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        let mga = $("h1.title a")
        return {
            name: mga
                .text()
                .toLowerCase()
                .replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase()),
            currentMangaURL: this.home + mga.attr("href"),
            currentChapterURL: curUrl.split(/[?#]/)[0]
        }
    }

    async getListImages(doc) {
        const $ = this.parseHtml(doc)
        let res = []

        $(".slideshow-container img").each(function (index) {
            res.push($(this).attr("src"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, ".slideshow-container img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
