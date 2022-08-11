import { BaseMirror } from "./BaseMirror"
import { InfoResult, MirrorImplementation } from "../../types/common"
import MangaFoxIcon from "../icons/mangafox-optimized.png"
import { MirrorHelper } from "../MirrorHelper"

export class MangaFox extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga-Fox"
    canListFullMangas = false
    mirrorIcon = MangaFoxIcon
    domains = ["fanfox.net", "mangafox.me"]
    languages = "en"
    home = "http://fanfox.net/"
    chapter_url = /\/manga\/.*\/.+\/.*/g

    async getMangaList(search) {
        const urlManga = "http://fanfox.net/search?name=" + search
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        if (doc.indexOf("No Manga Series") !== -1) {
            return []
        }

        const info: InfoResult[] = []
        const $ = this.parseHtml(doc)
        $(".manga-list-4-list li p.manga-list-4-item-title a").each(function (index, a) {
            info.push([$(a).text(), "http://fanfox.net" + $(a).attr("href")])
        })
        return info
    }

    async getCurrentPageInfo(doc: string, curUrl: string) {
        const mga = this.queryHtml(doc, ".reader-header-title-1 a")
        return {
            name: mga.text(),
            currentMangaURL: "http://fanfox.net" + mga.attr("href"),
            currentChapterURL: curUrl.substr(0, curUrl.lastIndexOf("/") + 1)
        }
    }

    async getImageUrlFromPage(urlImage: string) {
        // loads the page containing the current scan
        let doc = await this.mirrorHelper.loadPage(urlImage, { crossdomain: true })
        const $ = this.parseHtml(doc)

        const [first] = $("#dm5_key")
        const mkey = first ? ($(first).val() as string) : ""

        let curl = urlImage.substr(0, urlImage.lastIndexOf("/") + 1),
            cid = this.getVariable({ doc, variableName: "chapterid" }),
            chapfunurl = curl + "chapterfun.ashx", // url to retrieve scan url
            curpage = this.getVariable({ doc, variableName: "imagepage" })

        const queryParams = new URLSearchParams({
            cid: cid,
            page: curpage,
            key: mkey
        })

        // get scan url (this function seems to work only within DM5, perhaps a control on Referer)
        const url = `${chapfunurl}?${queryParams}`
        const data = await this.mirrorHelper.loadPage(url, {
            nocontenttype: true,
            headers: {
                "x-cookie": "isAdult=1",
                "x-referer": urlImage,
                "X-Requested-With": "XMLHttpRequest",
                Referer: urlImage
            }
        })
        // the retrieved data is packed through an obfuscator
        // dm5 is unpacking the images url through an eval, we can't do that in AMR due to CSP
        // we do it manually (below is the unpack function shipped with the data to decode)
        let unpack = function (p, a, c, k, e, d) {
            e = function (c) {
                return (
                    // @ts-ignore
                    (c < a ? "" : e(parseInt(c / a))) +
                    ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
                )
            }
            if (!"".replace(/^/, String)) {
                while (c--) d[e(c)] = k[c] || e(c)
                k = [
                    function (e) {
                        return d[e]
                    }
                ]
                e = function () {
                    return "\\w+"
                }
                c = 1
            }
            while (c--) if (k[c]) p = p.replace(new RegExp("\\b" + e(c) + "\\b", "g"), k[c])
            return p
        }

        // regexp to parse the arguments to pass to the unpack function, just parse the 4 first arguments
        let regexpargs = /'(([^\\']|\\')*)',([0-9]+),([0-9]+),'(([^\\']|\\')*)'/g
        let match = regexpargs.exec(data)
        if (match) {
            const args = [match[1], match[3], match[4], match[5].split("|"), 0, {}]
            // @ts-ignore
            let sc = unpack(...args) // call the unpack function
            sc = sc.replace(/\\'/g, "'") // unquote the result
            // the result is another js function containing the data, we mimic here what it does
            // retrieve the variables
            let cid = this.mirrorHelper.getVariableFromScript("cid", sc),
                key = this.mirrorHelper.getVariableFromScript("key", sc),
                pix = this.mirrorHelper.getVariableFromScript("pix", sc),
                pvalue = this.mirrorHelper.getVariableFromScript("pvalue", sc) // array of scan urls (contains current one and next one)
            pvalue = pvalue.map(img => pix + img + "?cid=" + cid + "&key=" + key) // mimic the returned function which rebuilds the url depending on its parts
            return pvalue[0]
        } else {
            return "error"
        }
    }

    async getListChaps(urlManga: string) {
        const response = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        let $ = this.parseHtml(response)
        if ($("#checkAdult").length > 0) {
            await this.mirrorHelper.setCookie({
                name: "isAdult",
                value: "1",
                path: "/",
                url: urlManga,
                domain: "fanfox.net",
                expirationDate: new Date().getTime() + 24 * 60 * 60 * 1000
            })
            const resp = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
            $ = this.parseHtml(resp)
        }

        let res = []
        $(".detail-main-list a").each(function () {
            let url = "http://fanfox.net" + $(this).attr("href")
            url = url.substr(0, url.lastIndexOf("/") + 1)
            let title = $(".title3", $(this)).text()
            res.push([title, url])
        })

        res.sort((a, b) => {
            let aM = a[0].match(/Ch\.([0-9]+\.?[0-9]+?)/)
            let bM = b[0].match(/Ch\.([0-9]+\.?[0-9]+?)/)
            if (aM && bM) {
                return parseFloat(aM[1]) > parseFloat(bM[1]) ? -1 : 1
            }
            return 0
        })
        return res
    }

    async getListImages(doc: string, curUrl: string) {
        const lastPage = this.getVariable({ doc, variableName: "imagecount" })
        const curl = curUrl.substr(0, curUrl.lastIndexOf("/") + 1)
        const res = []

        for (let i = 1; i <= lastPage; i++) {
            res.push(curl + i + ".html")
        }
        return res
    }

    isCurrentPageAChapterPage(doc: string, curUrl: string) {
        return this.queryHtml(doc, ".reader-main").length > 0
    }
}
