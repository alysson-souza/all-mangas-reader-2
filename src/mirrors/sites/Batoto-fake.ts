import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"

export class BatotoFake extends BaseMirror implements MirrorImplementation {
    constructor(mirrorHelper: MirrorHelper) {
        super(mirrorHelper)
    }

    mirrorName = "Batoto (fake)"
    mirrorIcon = "batoto.png"
    languages = "en"
    domains = ["bato.to", "batotoo.com", "comiko.net", "mto.to", "mangatoto.com", "dto.to"]
    home = "https://bato.to"
    chapter_url = /^\/chapter\/.+$/g

    globalVariables = ["batoPass", "batoWord"]

    public async getMangaList(search, url = null) {
        let doc
        if (!url) {
            doc = await this.mirrorHelper.loadPage(this.home + "/search?word=" + search, {
                nocache: true,
                preventimages: true
            })
        } else {
            doc = await this.mirrorHelper.loadPage(url, { nocache: true, preventimages: true })
        }

        const res = []
        const self = this

        const $ = this.parseHtml(doc)

        $("a.item-title[href*='/series/']").each(function () {
            res.push([$(this).text().trim(), self.home + $(this).attr("href")])
        })
        const nextPage = $("li.page-item:last")
        if (!nextPage.hasClass("disabled")) {
            res.push(...(await self.getMangaList("", self.home + nextPage.find("a").attr("href"))))
        }
        return res
    }

    public async getListChaps(urlManga: string) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        const self = this
        const $ = this.parseHtml(doc)
        $(".main a.chapt").each(function (index) {
            res.push([$(this).text(), self.home + $(this).attr("href")])
        })
        return res
    }

    public async getCurrentPageInfo(doc: string, curUrl: string) {
        const $ = this.parseHtml(doc)
        const title = $("h3.nav-title a", doc).first()
        return {
            name: title.text(),
            currentMangaURL: this.home + title.attr("href"),
            currentChapterURL: curUrl.split("/").slice(0, 5).join("/")
        }
    }

    public async getListImages(doc: string, _currentUrl: string, _sender: unknown) {
        let regex = /const batoPass = (.*?);/g
        let matches = regex.exec(doc)
        // Deobfuscation logic that converts the mess that looks like [+!+[]]+[!+[]+!+[]]] into a string of a decimal number
        const batoPass = matches[1]
            .replace(/\(.+\)\[.+?\]\+/, ".+")
            .replace(/!\+\[\]/g, "1")
            .replace(/\[\+\[\]\]/g, "[0]")
            .replace(/1(?:\+1)*/g, match => String((match.length + 1) / 2))
            .replace(/(?<=[[(])\+1/g, "1")
            .replace(/\[(\d)\]/g, "$1")
            .replace(/\+/g, "")

        regex = /const batoWord = "(.*?)";/g
        matches = regex.exec(doc)
        const batoWord = matches[1]

        const crypto = this.mirrorHelper.crypto
        const decrypted = JSON.parse(crypto.AES.decrypt(batoWord, batoPass).toString(this.mirrorHelper.crypto.enc.Utf8))

        const images = this.getVariable({ doc, variableName: "imgHttps" })
        return images.map((image, index) => image + "?" + decrypted[index])
    }

    public async getImageUrlFromPage(urlImg: string) {
        return urlImg
    }

    public isCurrentPageAChapterPage(doc: string) {
        return this.queryHtml(doc, "div#viewer").length > 0
    }
}
