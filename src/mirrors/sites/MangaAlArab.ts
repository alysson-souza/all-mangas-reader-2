import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaAlArabIcon from "../icons/mangaae-optimized.png"

export class MangaAlArab extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga Al-arab"
    canListFullMangas = false
    mirrorIcon = MangaAlArabIcon
    languages = "en"
    domains = ["manga.ae"]
    home = "https://www.manga.ae/"
    chapter_url = /^\/.*\/[0-9]+.*$/g

    async getMangaList(search: string) {
        let doc = await this.mirrorHelper.loadPage("https://www.manga.ae/manga/search%3A" + search, {
            nocache: true,
            preventimages: true,
            headers: { "user-agent": "Mozilla/5.0" } // if no user agent, manga al arab server failed
        })

        let res = []
        let _self = this
        const $ = this.parseHtml(doc)

        $("#mangadirectory .mangacontainer").each(function (index) {
            let a = $("a.manga:first", $(this))
            res.push([a.text(), a.attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, {
            nocache: true,
            preventimages: true,
            headers: { "user-agent": "Mozilla/5.0" } // if no user agent, manga al arab server failed
        })

        let res = []
        let _self = this
        const $ = this.parseHtml(doc)

        $("ul.new-manga-chapters a.chapter").each(function (index) {
            res.push([$(this).text(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        let mg = $(".showchapterdirectory .manga")
        return {
            name: mg.text(),
            currentMangaURL: this.addTrailingSlash(mg.attr("href")),
            currentChapterURL: this.addTrailingSlash($(".showchapterdirectory .chapter").attr("href"))
        }
    }

    async getListImages(doc) {
        const $ = this.parseHtml(doc)
        let res = []

        $("#morepages a").each(function (index) {
            res.push($(this).attr("href"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc) {
        return this.queryHtml(doc, "#showchaptercontainer img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        let doc = await this.mirrorHelper.loadPage(urlImage, {
            headers: { "user-agent": "Mozilla/5.0" } // if no user agent, manga al arab server failed
        })
        const $ = this.parseHtml(doc)
        var src = $("#showchaptercontainer img", doc).attr("src")
        return src
    }

    addTrailingSlash(url): string {
        if (!url) return url
        if (url.lastIndexOf("/") !== url.length - 1) {
            return url + "/"
        }
        return url
    }
}
