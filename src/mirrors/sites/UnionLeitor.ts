import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import UnionLeitorIcon from "../icons/unionleitor-optimized.png"

export class UnionLeitor extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Union Leitor"
    canListFullMangas = false
    mirrorIcon = UnionLeitorIcon
    languages = "en"
    domains = ["unionleitor.top", "unionmangas.top", "unionmangasbr.top"]
    home = "https://unionmangasbr.top/"
    chapter_url = /\/leitor\/.*\/.*/g

    async getMangaList(search: string) {
        var urlManga = this.home + "busca"
        let doc = await this.mirrorHelper.loadPage(urlManga, {
            nocache: true,
            preventimages: true,
            post: true,
            data: {
                pesquisa: search
            }
        })
        const $ = this.parseHtml(doc)
        var res = []
        $(".bloco-manga").each(function (index, bloc) {
            let link = $(bloc).find("a:last")
            if (link) {
                res.push([link.text().trim(), link.attr("href")])
            }
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const $ = this.parseHtml(doc)
        let res = []
        $('.col-md-8 .capitulos a[href*="/leitor/"]').each(function () {
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)

        let mga = $(".breadcrumbs div div a:last")
        return {
            name: mga.text().trim(),
            currentMangaURL: mga.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        let res = []
        const $ = this.parseHtml(doc)
        $("img.img-manga").each(function (index, element) {
            res.push($(this).attr("src"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "img.img-manga").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
