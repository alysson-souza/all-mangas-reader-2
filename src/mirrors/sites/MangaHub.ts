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
        let doc = await this.mirrorHelper.loadPage(url, { preventimages: true })
        let res = []
        const $ = this.parseHtml(doc)
        $("._1KYcM h4 a").each(function (ind) {
            res.push([$(this).text(), $(this).attr("href")])
        })

        const nextPage = $("ul.pager li.next:first")
        if (nextPage.length > 0) {
            res = [...res, ...(await this.searchPage(nextPage.attr("href")))]
        }
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        let res = []
        const $ = this.parseHtml(doc)
        $("li._287KE a._2U6DJ").each(function () {
            res.push([$("span._3D1SJ", this).text() + " " + $("span._2IG5P", this).text(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        let seriesLink = this.queryHtml(doc, "._1Gflr a")
        return {
            name: seriesLink.text(),
            currentMangaURL: seriesLink.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        let parts = curUrl.split("/")
        let slug = parts[4]
        let chapter = parts[5].replace("chapter-", "")

        const query = `{"query":"{chapter(x:m01,slug:\\"${slug}\\",number:${chapter}){id,title,mangaID,number,slug,date,pages,noAd,manga{id,title,slug,mainSlug,author,isWebtoon,isYaoi,isPorn,isSoftPorn,unauthFile,isLicensed}}}\"}`

        const json = await this.scriptJson({
            url: "https://api.mghubcdn.com/graphql",
            target: { tabId: sender.tab.id },
            config: {
                method: "post",
                body: query
            }
        })

        let res = []
        let cdnUrl = "https://img.mghubcdn.com/file/imghub/"
        let pages = Object.values(JSON.parse(json.data.chapter.pages))
        for (const page of pages) {
            res.push(cdnUrl + page)
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
