import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaHubIcon from "../icons/mangahub-optimized.png"

export class MangaHub extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga Hub"
    canListFullMangas = false
    mirrorIcon = MangaHubIcon
    languages = "en"
    domains = ["mangahub.io"]
    home = "https://mangahub.io/"
    chapter_url = /\/chapter\/.*\/chapter-.*/g

    async getMangaList(search: string) {
        return this.searchPage(this.home + "search?q=" + search)
    }
    async searchPage(url: string) {
        const doc = await this.mirrorHelper.loadPage(url, { preventimages: true })
        const res = []
        const $ = this.parseHtml(doc)
        $("._1KYcM h4 a").each(function (ind) {
            res.push([$(this).text(), $(this).attr("href")])
        })

        const nextPageLink = $("ul.pager li.next a").first()
        if (nextPageLink.length > 0) {
            res.push(...(await this.searchPage(nextPageLink.attr("href"))))
        }
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        const $ = this.parseHtml(doc)
        $("li._287KE a._3pfyN").each(function () {
            res.push([$("span._3D1SJ", this).text() + " " + $("span._2IG5P", this).text(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const seriesLink = this.queryHtml(doc, "._1Gflr a")
        return {
            name: seriesLink.text(),
            currentMangaURL: seriesLink.attr("href"),
            currentChapterURL: curUrl.includes("?") ? curUrl.split("?")[0] : curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const parts = curUrl.split("/")
        const slug = parts[4]
        let chapter = parts[5].replace("chapter-", "")

        if (chapter.includes("?")) {
            chapter = chapter.split("?")[0]
        }

        const query = `{"query":"{chapter(x:m01,slug:\\"${slug}\\",number:${chapter}){id,title,mangaID,number,slug,date,pages,noAd,manga{id,title,slug,mainSlug,author,isWebtoon,isYaoi,isPorn,isSoftPorn,unauthFile,isLicensed}}}\"}`

        const mhubCookie = await this.mirrorHelper.getCookie({
            url: curUrl,
            name: "mhub_access"
        })

        const json = await this.scriptJson({
            url: "https://api.mghubcdn.com/graphql",
            target: { tabId: sender.tab.id },
            config: {
                method: "post",
                body: query,
                headers: { "x-mhub-access": mhubCookie?.value }
            }
        })

        const res = []
        const cdnUrl = "https://img.mghubcdn.com/file/imghub/"
        const pages = Object.values(JSON.parse(json.data.chapter.pages))
        for (const page of pages[1] as any[]) {
            res.push(cdnUrl + pages[0] + page)
        }
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "img.PB0mN").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
