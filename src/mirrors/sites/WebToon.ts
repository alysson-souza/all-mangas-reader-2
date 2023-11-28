import { BaseMirror } from "./abstract/BaseMirror"
import { CurrentPageInfo, MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import WebToonIcon from "../icons/webtoons-optimized.png"

export class WebToon extends BaseMirror implements MirrorImplementation {
    mirrorName = "WebToons"
    canListFullMangas = false
    mirrorIcon = WebToonIcon
    languages = "en"
    domains = ["webtoons.com"]
    home = "https://www.webtoons.com"
    chapter_url = /^.*\/viewer.+$/g

    constructor(mirrorHelper: MirrorHelper) {
        super(mirrorHelper)
    }

    private fixUrl(url: string) {
        if (!url.includes(this.home)) {
            return this.home + url
        }
    }

    setCookie() {
        this.mirrorHelper.setCookie({
            // set the cookie for english
            name: "locale",
            value: "en",
            url: this.home,
            path: "/",
            domain: ".webtoons.com",
            expirationDate: new Date().getTime() + 24 * 60 * 60 * 1000
        })
    }

    async getMangaList(search: string) {
        await this.setCookie()
        const doc = await this.mirrorHelper.loadPage(this.home + "/en/search?keyword=" + search, {
            nocache: true,
            preventimages: true
        })
        const _self = this
        const resOrig = []
        const $ = this.parseHtml(doc)
        $(".challenge_lst li a, .card_lst li a").each(function () {
            resOrig.push([$(".subj", $(this)).text().trim(), _self.fixUrl($(this).attr("href"))])
        })

        const res = []
        for (const [name, mangaUrl] of resOrig) {
            const doc2 = await this.mirrorHelper.loadPage(mangaUrl, { preventimages: true })
            const url = doc2.match(/<meta property="og:url" content="([^"]+)" \/>/)
            res.push([name, url[1]])
        }
        return res
    }

    async getListChaps(urlManga: string) {
        await this.setCookie()
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        let $ = this.parseHtml(doc)
        $(".detail_lst li > a", doc).each(function (index) {
            res.push([
                $(".tx", $(this)).text().trim() + " - " + $(".subj span", $(this)).text().trim(),
                $(this).attr("href")
            ])
        })
        while ($(".paginate > a[href='#']").next().length > 0) {
            await new Promise(r => setTimeout(r, 500))
            const nextpage = "https://www.webtoons.com" + $(".paginate > a[href='#']").next().attr("href")
            doc = await this.mirrorHelper.loadPage(nextpage, { nocache: true, preventimages: true })
            $ = this.parseHtml(doc)
            $(".detail_lst li > a").each(function () {
                res.push([
                    $(".tx", $(this)).text().trim() + " - " + $(".subj span", $(this)).text().trim(),
                    $(this).attr("href")
                ])
            })
        }
        return res
    }

    async getCurrentPageInfo(doc: string, curUrl: string): Promise<CurrentPageInfo> {
        const subject = this.queryHtml(doc, ".subj_info a")
        return {
            name: subject.text().trim(),
            currentMangaURL: subject.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc: string, curUrl: string) {
        const res: string[] = []
        const $ = this.parseHtml(doc)
        $("#_imageList img").each(function (index) {
            res.push($(this).attr("data-url"))
        })
        return res
    }

    async getImageUrlFromPage(urlImg) {
        return urlImg
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "#_imageList img").length > 0
    }
}
