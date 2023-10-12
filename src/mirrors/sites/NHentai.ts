import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import NHentaiIcon from "../icons/n-hentai-optimized.png"

export class NHentai extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "NHentai"
    canListFullMangas = false
    mirrorIcon = NHentaiIcon
    languages = "en"
    domains = ["nhentai.net"]
    home = "http://nhentai.net/"
    chapter_url = /^\/g\/\d+\/\d+/g

    async getMangaList(search: string) {
        return []
        // let doc = await amr.loadPage(this.home + "/search/?q=" + search, { nocache: true, preventimages: true })
        // let res = []
        // let self = this

        // $("div.index-container a.cover", doc).each(function () {
        //     res.push([
        //         $("div.caption", this).text().trim(),
        //         self.home + $(this).attr("href")
        //     ])
        // })

        // let nextPage = $("li.page-item:last", doc)
        // if (!nextPage.hasClass("disabled")) {
        //     res.push(...(await self.getMangaList("", self.home + nextPage.find("a").attr("href"))))
        // }
        // return res
    }

    async getListChaps(urlManga) {
        // let doc = await amr.loadPage(urlManga, { nocache: true, preventimages: true })
        // let res = []
        // let self = this
        // $(".main a.chapt", doc).each(function (index) {
        //     res.push([$(this).text(), self.home + $(this).attr("href")])
        // })
        // return res

        let res = []
        res.push(["Chapter 1", urlManga + "/1/"])
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        let seriesUrl = curUrl.split("/").slice(0, 5).join("/")
        let doc2 = await this.mirrorHelper.loadPage(seriesUrl, { nocache: true, preventimages: true })

        const $ = this.parseHtml(doc2)
        var mgtitle = $($("h1.title .pretty")[0])

        let firstChapter = curUrl.split("/")
        firstChapter[5] = 1

        return {
            name: mgtitle.text(),
            currentMangaURL: seriesUrl,
            currentChapterURL: firstChapter.join("/")
        }
    }

    async getListImages(doc, curUrl, sender) {
        let res = []
        const $ = this.parseHtml(doc)

        let lastPage = parseInt($($(".reader-bar a.last")[0]).attr("href").split("/")[3])

        let baseUrl = curUrl.split("/").slice(0, 5).join("/")

        for (const page of Array(lastPage).keys()) {
            let url = baseUrl + "/" + (page + 1) + "/"
            let doc2 = await await this.mirrorHelper.loadPage(url)
            const $$ = this.parseHtml(doc2)
            res.push($$("#image-container img").attr("src"))
            await new Promise(r => setTimeout(r, 250))
        }
        return res

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

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml("#image-container img", doc).length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
