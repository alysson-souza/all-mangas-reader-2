import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import SubMangaIcon from "../icons/submanga-optimized.png"

export class SubManga extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Union Leitor"
    canListFullMangas = false
    mirrorIcon = SubMangaIcon
    languages = "en"
    domains: ["submanga.online", "submanga.com", "submanga.io"]
    home: "https://submanga.online/"
    chapter_url = /^\/manga\/.*\/.+$/g

    async getMangaList(search: string) {
        let doc = await this.mirrorHelper.loadPage("https://submanga.online/mangas/buscar", {
            preventimages: true,
            data: { q: search },
            post: true
        })
        let res = []
        const $ = this.parseHtml(doc)
        $(".panel-body .caption h3 a").each(function (ind) {
            res.push([$(this).text(), "https://submanga.online" + $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const $ = this.parseHtml(doc)
        let res = []
        $(".capitulos-list a").each(function (index) {
            res[res.length] = [$(this).text(), "https://submanga.online" + $(this).attr("href")]
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)

        if ($("#boton.anterior").length > 0) {
            // reading from reader
            let chapurl = $("meta[property='og:url']").attr("content")
            if (chapurl.indexOf("http:")) chapurl = chapurl.substring(4)
            if (chapurl.indexOf("https:")) chapurl = chapurl.substring(5) //reload reader from first page
            let docinit = await this.mirrorHelper.loadPage(chapurl)
            const $$ = this.parseHtml(docinit)
            let urlref = $$("#boton.anterior").attr("href") // button link is from main site
            let paths = urlref.split("/")
            return {
                name: $$("a[href='" + urlref + "']").text(),
                currentMangaURL: paths.splice(0, paths.length - 1).join("/"),
                currentChapterURL: urlref
            }
        } else {
            let paths = curUrl.split("/")
            let name = $($(".panel-heading h3")[0]).text().trim()
            if (name.endsWith("manga")) name = name.substring(0, name.length - 5).trim()
            return {
                name: name,
                currentMangaURL: paths.slice(0, paths.length - 1).join("/"),
                currentChapterURL: curUrl
            }
        }
    }

    async getListImages(doc, curUrl, sender) {
        const $ = this.parseHtml(doc)
        const self = this
        let getimgs = function (doc, url) {
            let res = []
            self.queryHtml(doc, "#select_paginas option").each(function () {
                res.push(url + "/" + $(this).val())
            })
            return res
        }
        let aredirect = $("a[href^='/mangas/leermanga/']")
        if (aredirect.length === 1) {
            // reading from main site
            let url = "https://submanga.online" + aredirect.attr("href")
            let docred = await this.mirrorHelper.loadPage(url, { nocache: true, preventimages: true })
            return getimgs(docred, url)
        } else {
            // reading from reader
            return getimgs(doc, $("meta[property='og:url']").attr("content"))
        }
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return (
            this.queryHtml(doc, "a[href^='/mangas/leermanga/']").length > 0 ||
            this.queryHtml(doc, "#page_img").length > 0
        )
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        let doc = await this.mirrorHelper.loadPage(urlImage)
        const $ = this.parseHtml(doc)
        var src = $("#page_img").attr("src")
        return "https://submanga.online" + src
    }
}
