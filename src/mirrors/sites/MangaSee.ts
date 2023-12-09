import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaSeeIcon from "../icons/mangasee-optimized.png"

export class MangaSee extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "MangaSee"
    canListFullMangas = true
    mirrorIcon = MangaSeeIcon
    languages = "en"
    domains = ["mangaseeonline.us", "mangasee123.com"]
    home = "https://mangasee123.com"
    chapter_url = /^\/read-online\/.+$/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(this.home + "/directory/", { nocache: true, preventimages: true })

        const res = []
        const _self = this

        const regex = /vm\.FullDirectory = (.*?)};/g
        const matches = regex.exec(doc)
        const directory = JSON.parse(matches[1] + "}")

        directory.Directory.forEach(manga => {
            res.push([manga.s, _self.home + "/manga/" + manga.i])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        const res = []
        const _self = this

        let regex = /vm\.Chapters = (.*?);/g
        let matches = regex.exec(doc)
        const chapters = JSON.parse(matches[1])

        regex = /vm\.IndexName = "(.*?)";/g
        matches = regex.exec(doc)
        const titlePath = matches[1]

        chapters.forEach(chapter => {
            const linkPart = _self.ChapterListLink(chapter.Chapter)
            const name = _self.ChapterListName(chapter.Type, chapter.Chapter)

            res.push([name, _self.home + "/read-online/" + titlePath + linkPart])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const mgtitle = $($('.MainContainer a[href*="manga"]')[0])
        return {
            name: mgtitle.text().trim().split("\n")[0].trim(),
            currentMangaURL: this.home + mgtitle.attr("href"),
            currentChapterURL: curUrl.replace("-page-1", "")
        }
    }

    async getListImages(doc, curUrl, sender) {
        const fullUrl = curUrl.replace("-page-1.html", ".html")
        doc = await this.mirrorHelper.loadPage(fullUrl, { nocache: true })
        let regex, matches

        regex = /vm\.CurChapter =(.*?);/g
        matches = regex.exec(doc)
        const vars = JSON.parse(matches[1])

        // regex = /vm\.CurChapter\s*=\s*\{.*?\};\s*vm\.\w+\s*=\s*"(.*?)";/g
        regex = /vm\.(\w+?)\s*=\s*\w+\.data\.val\.PathName/g
        matches = regex.exec(doc)
        regex = new RegExp("vm\\." + matches[1] + '\\s*=\\s*\\"(.*?)\\"', "g")
        matches = regex.exec(doc)
        const cdnPath = matches[1]

        regex = /vm\.IndexName = "(.*?)";/g
        matches = regex.exec(doc)
        const titlePath = matches[1]

        const res = []
        const chapImage = this.ChapterImage(vars.Chapter)
        const extraDir = vars.Directory == "" ? "" : vars.Directory + "/"
        for (let i = 1; i <= vars.Page; i++) {
            const pageImage = this.PageImage(i)
            res.push(`https://${cdnPath}/manga/${titlePath}/${extraDir}${chapImage}-${pageImage}.png`)
        }
        console.log(res)
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "div#readerarea").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }

    ChapterListLink(id: string) {
        const stupidvar1 = id.substring(0, 1)
        const chapterNumber = parseInt(id.slice(1, -1))
        const chapterPart = id.slice(-1)
        const index = stupidvar1 != "1" ? "-index-" + stupidvar1 : ""
        const chapterPartDisplay = chapterPart != "0" ? "." + chapterPart : ""

        return "-chapter-" + chapterNumber + chapterPartDisplay + index + ".html"
    }

    ChapterListName(type, id) {
        const blah = (type != "" ? type : "Chapter") + " "
        const chapterNumber = parseInt(id.slice(1, -1))
        const chapterPart = id[id.length - 1]
        return (blah + (chapterPart == 0 ? chapterNumber : chapterNumber + "." + chapterPart)).trim()
    }

    ChapterImage(ChapterString) {
        var Chapter = ChapterString.slice(1, -1)
        var Odd = ChapterString.slice(-1)
        if (Odd == 0) {
            return Chapter
        } else {
            return Chapter + "." + Odd
        }
    }

    PageImage(PageString) {
        var s = "000" + PageString
        return s.substring(s.length - 3)
    }
}
