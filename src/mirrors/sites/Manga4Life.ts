import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import { BaseMirror } from "./abstract/BaseMirror"
import mirrorIcon from "../icons/manga4life-optimized.png"

export class Manga4Life extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga4Life"
    canListFullMangas = true
    mirrorIcon = mirrorIcon
    languages = "en"
    domains = ["manga4life.com"]
    home = "https://manga4life.com"
    chapter_url = /^\/read-online\/.+$/g

    async getMangaList(search) {
        const response = await this.mirrorHelper.loadPage(`${this.home}/directory/`, {
            nocache: true,
            preventimages: true
        })

        const res = []

        const regex = /vm\.FullDirectory = (.*?)};/g
        const matches = regex.exec(response)
        const directory = JSON.parse(matches[1] + "}")

        directory.Directory.forEach(manga => {
            res.push([manga.s, this.home + "/manga/" + manga.i])
        })
        return res
    }

    async getListChaps(urlManga) {
        const text = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []

        const regex = /vm\.Chapters = (.*?);/g

        const matches = regex.exec(text)
        const chapters = JSON.parse(matches[1])

        const nameRegex = /vm\.IndexName = "(.*?)";/g
        const titlePath = nameRegex.exec(text)[1]

        chapters.forEach(chapter => {
            const linkPart = this.ChapterListLink(chapter.Chapter)
            const name = this.ChapterListName(chapter.Type, chapter.Chapter)

            res.push([name, this.home + "/read-online/" + titlePath + linkPart])
        })
        return res
    }

    async getCurrentPageInfo(doc: string, curUrl: string) {
        const title = this.queryHtml(doc, '.MainContainer a[href*="manga"]').first()
        return {
            name: title.text().trim().split("\n")[0].trim(),
            currentMangaURL: this.home + title.attr("href"),
            currentChapterURL: curUrl.replace("-page-1", "")
        }
    }

    async getListImages(doc: string, curUrl: string) {
        let fullUrl = curUrl.replace("-page-1.html", ".html")
        const text = await this.mirrorHelper.loadPage(fullUrl, { nocache: true })
        let regex, matches

        regex = /vm\.CurChapter =(.*?);/g
        matches = regex.exec(text)
        let vars = JSON.parse(matches[1])

        // regex = /vm\.CurChapter\s*=\s*\{.*?\};\s*vm\.\w+\s*=\s*"(.*?)";/g
        regex = /vm\.(\w+?)\s*=\s*\w+\.data\.val\.PathName/g
        matches = regex.exec(text)
        regex = new RegExp("vm\\." + matches[1] + '\\s*=\\s*\\"(.*?)\\"', "g")

        matches = regex.exec(text)
        let cdnPath = matches[1]

        regex = /vm\.IndexName = "(.*?)";/g
        matches = regex.exec(text)
        let titlePath = matches[1]

        let res = []
        let chapImage = this.ChapterImage(vars.Chapter)
        let extraDir = vars.Directory == "" ? "" : vars.Directory + "/"
        for (let i = 1; i <= vars.Page; i++) {
            let pageImage = this.PageImage(i)
            res.push(`https://${cdnPath}/manga/${titlePath}/${extraDir}/${chapImage}-${pageImage}.png`)
        }
        return res
    }

    private ChapterListLink(id: string) {
        let stupidvar1 = id.substr(0, 1)
        let chapterNumber = parseInt(id.slice(1, -1))
        let chapterPart = id.slice(-1)
        let index = Number(stupidvar1) !== 1 ? "-index-" + stupidvar1 : ""
        let chapterPartDisplay = Number(chapterPart) !== 0 ? "." + chapterPart : ""
        return "-chapter-" + chapterNumber + chapterPartDisplay + index + ".html"
    }

    private ChapterListName(type: string, id: string) {
        let blah = (type != "" ? type : "Chapter") + " "
        let chapterNumber = parseInt(id.slice(1, -1))
        let chapterPart = id[id.length - 1]
        return (blah + (Number(chapterPart) === 0 ? chapterNumber : chapterNumber + "." + chapterPart)).trim()
    }

    private ChapterImage(ChapterString: string) {
        const Chapter = ChapterString.slice(1, -1)
        const Odd = ChapterString.slice(-1)
        return Number(Odd) === 0 ? Chapter : Chapter + "." + Odd
    }

    private PageImage(PageString: string | number) {
        const s = "000" + PageString
        return s.substr(s.length - 3)
    }

    public async getImageUrlFromPage(urlImage: string) {
        return urlImage
    }

    isCurrentPageAChapterPage(doc: string) {
        return this.queryHtml(doc, "div.ImageGallery").length > 0
    }
}
