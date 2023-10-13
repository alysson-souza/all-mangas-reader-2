import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ScanTradUnionIcon from "../icons/scantradunion-optimized.png"

export class ScanTradUnion extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Scantrad Union"
    canListFullMangas = false
    mirrorIcon = ScanTradUnionIcon
    languages = "fr"
    domains = ["scantrad-union.com"]
    home = "https://scantrad-union.com/"
    chapter_url = /^\/read\/.+\/chapter-.+/g

    async getMangaList(search: string) {
        let doc = await this.mirrorHelper.loadPage(this.home + "wp-admin/admin-ajax.php", {
            nocache: true,
            preventimages: true,
            post: true,
            data: {
                action: "ajaxsearchpro_search",
                aspp: search,
                asid: "1",
                asp_inst_id: "1_1",
                options: "current_page_id=7944&qtranslate_lang=0&asp_gen%5B%5D=title&customset%5B%5D=manga"
            }
        })
        let res = []
        const $ = this.parseHtml(doc)
        $("a.asp_res_url").each(function () {
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const $ = this.parseHtml(doc)
        let res = []
        $(".accordionItemContent li, .accordionItem li").each(function (index) {
            res.push([
                $(".chapter-number", this).text().replace("#", "").trim(),
                $('a:contains("Lire")', this).attr("href")
            ])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)

        return {
            name: $("#manga-title").text().trim(),
            currentMangaURL: this.home + "manga/" + curUrl.split("/")[4] + "/",
            currentChapterURL: curUrl.split("/").slice(0, 8).join("/")
        }
    }

    async getListImages(doc, curUrl, sender) {
        let res = []
        const $ = this.parseHtml(doc)
        $("#webtoon img").each(function (index) {
            let imageURL = $(this).attr("data-src")
            if (typeof imageURL === "undefined") {
                //some pages don't use the data-src atttribute for url image
                imageURL = $(this).attr("src")
            }
            res.push(imageURL)
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "#webtoon img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
