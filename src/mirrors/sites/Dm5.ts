import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import Dm5Icon from "../icons/dm5-optimized.png"

export class Dm5 extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "DM5"
    canListFullMangas = false
    mirrorIcon = Dm5Icon
    languages = "cn"
    domains = ["dm5.com"]
    home = "https://www.dm5.com"
    chapter_url = /^\/m[0-9]+\/$/g

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage(
            this.home + "/search.ashx?d=" + new Date().getTime() + "&t=" + search + "&language=1",
            {
                nocache: true,
                preventimages: true
            }
        )

        const res = []
        const _self = this
        const $ = this.parseHtml(doc)

        $("li").each(function () {
            let url = $(this).attr("onclick")
            const st = url.indexOf("'"),
                en = url.lastIndexOf("'")
            url = url.substring(st + 1, en)
            if ($(this).attr("value") !== "0") {
                res[res.length] = [$(".left", $(this)).text(), _self.home + url]
            }
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        let $ = this.parseHtml(doc)
        if ($("#checkAdult", doc).length > 0) {
            // pass adult test
            this.mirrorHelper.setCookie({
                // set the cookie on dm5 domain
                name: "isAdult",
                value: "1",
                path: "/",
                url: urlManga,
                domain: "www.dm5.com",
                expirationDate: new Date().getTime() + 24 * 60 * 60 * 1000
            })
            doc = await this.mirrorHelper.loadPage(urlManga, {
                // and reload the page
                nocache: true,
                preventimages: true
            })
            $ = this.parseHtml(doc)
        }

        let res = []
        const _self = this

        $("#chapterlistload li > a").each(function (index) {
            $("span", $(this)).remove()
            let name = $(this).text()
            if ($(".title", $(this)).length > 0) name = $(".title", $(this)).text()
            res[res.length] = [name, _self.home + $(this).attr("href")]
        })
        if ($("#chapterlistload .cover", doc).length > 0) res = res.reverse()
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const mg = $(".view-header-2 .title a[href!='/']")
        return {
            name: mg.attr("title"),
            currentMangaURL: this.home + mg.attr("href"),
            currentChapterURL: this.home + this.mirrorHelper.getVariableFromScript("DM5_CURL", doc)
        }
    }

    async getListImages(doc) {
        const $ = this.parseHtml(doc)
        const res = []
        $("img.load-src").each(function () {
            res.push($(this).attr("data-src"))
        })
        /*const lastpage = this.mirrorHelper.getVariableFromScript("DM5_IMAGE_COUNT", doc),
            curl = this.mirrorHelper.getVariableFromScript("DM5_CURL", doc),
            res = []

        for (let i = 1; i <= lastpage; i++) {
            res.push(this.home + curl.slice(0, -1) + "-p" + i + "/")
        }*/
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        //return this.queryHtml(doc, "#cp_img").length > 0
        return this.chapter_url.test(new URL(curUrl).pathname)
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
        /* // loads the page containing the current scan
        const doc = await this.mirrorHelper.loadPage(urlImage)
        const $ = this.parseHtml(doc)
        var mkey = ""
        if ($("#dm5_key").length > 0) {
            mkey = $("#dm5_key", doc).val().toString()
        }
        let curl = this.mirrorHelper.getVariableFromScript("DM5_CURL", doc),
            cid = this.mirrorHelper.getVariableFromScript("DM5_CID", doc),
            mid = this.mirrorHelper.getVariableFromScript("DM5_MID", doc),
            dt = this.mirrorHelper.getVariableFromScript("DM5_VIEWSIGN_DT", doc), // valid date for the sign key
            sign = this.mirrorHelper.getVariableFromScript("DM5_VIEWSIGN", doc), // sign key
            chapfunurl = "https://www.dm5.com" + curl + "chapterfun.ashx", // url to retrieve scan url
            curpage = 1,
            re = /m\d+-p(\d+)\/?/,
            mat = urlImage.match(re)
        if (mat != null && mat.length > 1) {
            curpage = parseInt(mat[1]) // set the current page depending on the scan to retrieve
        }
        let params = {
            // Build parameters for the request
            cid: cid,
            page: curpage,
            key: mkey,
            language: 1,
            gtk: 6,
            _cid: cid,
            _mid: mid,
            _dt: dt,
            _sign: sign
        }
        // get scan url (this function seems to work only within DM5, perhaps a control on Referer)
        let data = await this.mirrorHelper.loadJson(chapfunurl, {
            data: params,
            nocontenttype: true,
            headers: { "X-Requested-With": "XMLHttpRequest" },
            referrer: urlImage
        })
        // the retrieved data is packed through an obfuscator
        // dm5 is unpacking the images url through an eval, we can't do that in AMR due to CSP
        // we do it manually (below is the unpack function shipped with the data to decode)
        let unpack = function (p, a, c, k, e, d) {
            e = function (c) {
                return (
                    (c < a ? "" : e(parseInt((c / a).toString()))) +
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
            let args = []
            let sc = unpack(match[1], match[3], match[4], match[5].split("|"), 0, {}) // call the unpack function
            sc = sc.replace(/\\'/g, "'") // unquote the result
            // the result is another js function containing the data, we mimic here what it does
            // retrieve the variables
            let cid = this.mirrorHelper.getVariableFromScript("cid", sc),
                key = this.mirrorHelper.getVariableFromScript("key", sc),
                pix = this.mirrorHelper.getVariableFromScript("pix", sc),
                pvalue = this.mirrorHelper.getVariableFromScript("pvalue", sc) // array of scan urls (contains current one and next one)
            pvalue = pvalue.map(img => pix + img + "?cid=" + cid + "&key=" + key) // mimic the returned function which rebuilds the url depending on its parts
            return pvalue[0] // set the image src
        } else {
            return "error"
        }*/
    }
}
