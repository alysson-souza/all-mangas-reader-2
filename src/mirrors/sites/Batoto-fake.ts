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
        // Seems like we stuck here, not allowed and we cannot convert to variable
        const batoPass = eval(matches[1])

        regex = /const batoWord = (.*?);/g
        matches = regex.exec(doc)
        const batoWord = eval(matches[1])

        const crypto = this.mirrorHelper.crypto
        const decrypted = JSON.parse(crypto.AES.decrypt(batoWord, batoPass).toString(this.mirrorHelper.crypto.enc.Utf8))
        console.debug("Batoto shit", batoPass, batoWord, decrypted)

        const images = this.getVariable({ doc, variableName: "imgHttpLis" })
        return images.map((image, index) => image + "?" + decrypted[index])
        // return images

        /*
        This new thing seems temp since its a full url so I am leaving the old code commented out for easier access later
        let images = amr.getVariable("images", doc)
        let server = amr.getVariable("server", doc)
        regex = /const batojs = (.*?);/g
        matches = regex.exec(doc.innerText)
        let key = eval(matches[1])

        let cdnPath = JSON.parse(amr.crypto.AES.decrypt(server, key).toString(amr.crypto.enc.Utf8))
        return images.map(image => cdnPath + image)
        */
    }

    public async getImageUrlFromPage(urlImg: string) {
        return urlImg
    }

    public isCurrentPageAChapterPage(doc: string) {
        return this.queryHtml(doc, "div#viewer").length > 0
    }
}
