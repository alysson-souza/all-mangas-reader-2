import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ReadComicOnlineIcon from "../icons/readcomiconline-optimized.png"

export class ReadComicOnline extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Read Comic Online"
    canListFullMangas = false
    mirrorIcon = ReadComicOnlineIcon
    languages = "en"
    domains = ["readcomiconline.to", "readcomiconline.li"]
    home = "https://readcomiconline.li/"
    chapter_url = /Comic\/.*\/.*\?id=/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(this.home + "/Search/Comic", {
            nocache: true,
            preventimages: true,
            post: true,
            data: {
                keyword: search
            }
        })

        const res = []
        const $ = this.parseHtml(doc)
        $("table.listing a").each(function (index) {
            if ($(this).attr("href").includes("/Comic/")) {
                res.push([$(this).text().trim(), "https://readcomiconline.li" + $(this).attr("href")])
            }
        })

        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, {
            nocache: true,
            preventimages: true
        })

        const res = []
        const $ = this.parseHtml(doc)
        const comicName = $("a.bigChar").text().trim()

        $("table.listing a").each(function (index) {
            if ($(this).attr("href").includes("/Comic/")) {
                res.push([
                    $(this).text().replace(comicName, "").trim(),
                    "https://readcomiconline.li" + $(this).attr("href")
                ])
            }
        })

        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const comicUrl = $("#navsubbar a")
        const nameParts = comicUrl.text().split("\n")
        let name = ""
        nameParts.forEach(part => {
            if (!(part.trim() == "" || part.trim() == "Comic" || part.trim() == "information")) {
                name += part + " "
            }
        })

        const url = new URL(curUrl)
        const newUrl = url.origin + url.pathname + "?id=" + url.searchParams.get("id")
        return {
            name: name.trim(),
            currentMangaURL: this.home + comicUrl.attr("href"),
            currentChapterURL: newUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const unpack = (urlImg: string, origin: any = false) => {
            let src = urlImg.replace(/pw_.g28x/g, "b").replace(/d2pr.x_27/g, "h")
            const alt = origin !== false
            if (!alt) origin = "https://2.bp.blogspot.com"

            if (src.indexOf("https") !== 0) {
                // if encoded
                const cmark = src.substring(src.indexOf("?"))

                let sIndex = src.indexOf("=s0?")
                const isSizeZero = sIndex > 0
                if (!isSizeZero) sIndex = src.indexOf("=s1600?")

                src = src.substring(4, sIndex)
                src = src.substring(0, 18) + src.substring(21)
                src = src.substring(0, src.length - 6) + src[src.length - 2] + src[src.length - 1]

                src = atob(src)

                src = src.substring(0, 13) + src.substring(17)
                src = src.substring(0, src.length - 2) + (isSizeZero ? "=s0" : "=s1600")

                src = origin + "/" + src + cmark
            } else if (alt) {
                // if not encoded, we still need to replace origin, when given
                src = src.replace("https://2.bp.blogspot.com", origin)
            }
            return src
        }

        doc = await this.mirrorHelper.loadPage(curUrl + "&readType=1&quality=hq", { nocache: true })
        let regex = /lstImages\.push\(['"](.*?)['"]\);/g
        const matches = doc.matchAll(regex)

        regex = /beau\(lstImages,\s*['"](?<origin>.*?)['"]\);/
        let { origin = false } = doc.match(regex).groups ?? {}
        if (origin.length === 0) origin = false

        return Array.from(matches, match => unpack(match[1], origin))
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "#divImage img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
