import { BaseMirror } from "./abstract/BaseMirror"
import { InfoResult, MirrorImplementation } from "../../types/common"
import MangaFoxIcon from "../icons/mangafox-optimized.png"
import { MirrorHelper } from "../MirrorHelper"
import { extractListOfImages } from "../zjcdn"

export class MangaFox extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    /**
     * Cookies:
     * SERVERID=node1; Path=/;
     * dm5imgpage=1114131|5:0; Path=/; Domain=fanfox.net; Expires=Wed, 24 Aug 2022 00:32:37 GMT;
     * image_time_cookie=1114131|637968403571317773|2; Path=/; Domain=fanfox.net; Expires=Tue, 23 Aug 2022 02:32:37 GMT;
     * isAdult=1; Path=/; Expires=Wed, 23 Aug 2023 03:27:51 GMT;
     *
     * Example
     *             var comicid = 29732;
     *             var chapterid = 1086840;
     *             var userid = 0;
     *             var imagepage = 1;
     *             var imagecount = 6;
     *             var pagerrefresh = false;
     *             var pagetype = 2;
     *             var postpageindex = 1;
     *             var postpagecount = 0;
     *             var postcount = 0;
     *             var postsort = 0;
     *             var topicId = 0;
     *             var prechapterurl = "/manga/internet_explorer/c079/1.html";
     *             var nextchapterurl = "/manga/internet_explorer/c081/1.html";
     **/

    // chapterid + "|" + (imagepage + index) = '1127475|2,1088036|2,1097923|2,1108155|2,1115272
    imageLoadCookie = "imageload"

    mirrorName = "Manga-Fox"
    canListFullMangas = false
    mirrorIcon = MangaFoxIcon
    domains = ["fanfox.net", "mangafox.me"]
    languages = "en"
    home = "https://fanfox.net/"
    chapter_url = /\/manga\/.*\/.+\/.*/g
    /** Use it to generate default schema with https **/
    currentDomain = "https://fanfox.net"

    async getMangaList(search) {
        const urlManga = this.currentDomain + "/search?name=" + search
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        if (doc.indexOf("No Manga Series") !== -1) {
            return []
        }

        const domain = this.currentDomain
        const info: InfoResult[] = []
        const $ = this.parseHtml(doc)
        $(".manga-list-4-list li p.manga-list-4-item-title a").each(function (index, a) {
            info.push([$(a).text(), domain + $(a).attr("href")])
        })
        return info
    }

    async getCurrentPageInfo(doc: string, curUrl: string) {
        const mga = this.queryHtml(doc, ".reader-header-title-1 a")
        return {
            name: mga.text(),
            currentMangaURL: this.currentDomain + mga.attr("href"),
            currentChapterURL: curUrl.substr(0, curUrl.lastIndexOf("/") + 1)
        }
    }

    async getImageUrlFromPage(urlImage: string) {
        // Relative schema url, pass it back.
        if (urlImage.startsWith("//") || urlImage.startsWith("https://zjcdn")) {
            // "//zjcdn.{somedomain.com}/store/manga/39145/001.0/compressed/m000.jpg",
            return urlImage
        }

        // loads the page containing the current scan
        const doc = await this.mirrorHelper.loadPage(urlImage, { crossdomain: true, redirect: "follow" })
        const $ = this.parseHtml(doc)

        const [first] = $("#dm5_key")
        const mkey = first ? ($(first).val() as string) : ""

        const curl = urlImage.substr(0, urlImage.lastIndexOf("/") + 1),
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
                "X-Cookie": "isAdult=1",
                "X-Referer": urlImage,
                "X-Requested-With": "XMLHttpRequest",
                Referer: urlImage
            }
        })

        if (!data) {
            throw new Error(`Failed to load unpack data from ${url}`)
        }

        // the retrieved data is packed through an obfuscator
        // dm5 is unpacking the images url through an eval, we can't do that in AMR due to CSP
        // we do it manually (below is the unpack function shipped with the data to decode)
        const unpack = function (p, a, c, k, e, d) {
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
        const regexpargs = /'(([^\\']|\\')*)',([0-9]+),([0-9]+),'(([^\\']|\\')*)'/g
        const match = regexpargs.exec(data)
        if (match) {
            const args = [match[1], match[3], match[4], match[5].split("|"), 0, {}]
            // @ts-ignore
            let sc = unpack(...args) // call the unpack function
            sc = sc.replace(/\\'/g, "'") // unquote the result
            // the result is another js function containing the data, we mimic here what it does
            // retrieve the variables
            const cid = this.mirrorHelper.getVariableFromScript("cid", sc),
                key = this.mirrorHelper.getVariableFromScript("key", sc),
                pix = this.mirrorHelper.getVariableFromScript("pix", sc)
            let pvalue = this.mirrorHelper.getVariableFromScript("pvalue", sc) // array of scan urls (contains current one and next one)
            pvalue = pvalue.map(img => pix + img + "?cid=" + cid + "&key=" + key) // mimic the returned function which rebuilds the url depending on its parts
            return pvalue[0]
        }
        throw new Error(`Failed to find matching arguments for unpack function`)
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

        const res = []
        const domain = this.currentDomain
        $(".detail-main-list a").each(function () {
            let url = domain + $(this).attr("href")
            url = url.substr(0, url.lastIndexOf("/") + 1)
            const title = $(".title3", $(this)).text()
            res.push([title, url])
        })

        res.sort((a, b) => {
            const aM = a[0].match(/Ch\.([0-9]+\.?[0-9]+?)/)
            const bM = b[0].match(/Ch\.([0-9]+\.?[0-9]+?)/)
            if (aM && bM) {
                return parseFloat(aM[1]) > parseFloat(bM[1]) ? -1 : 1
            }
            return 0
        })
        return res
    }

    async getListImages(doc: string, curUrl: string) {
        // Check if we have embedded list of images
        if (doc.includes("eval(function") && doc.includes("zjcdn")) {
            return extractListOfImages(doc)
        }

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
