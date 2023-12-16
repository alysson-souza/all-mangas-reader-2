import { BaseMirror } from "./abstract/BaseMirror"
import { CurrentPageInfo, InfoResult, MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaHereIcon from "../icons/mangahere-optimized.png"

export class MangaHere extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manga Here"
    canListFullMangas = false
    mirrorIcon = MangaHereIcon
    languages = "en"
    domains = ["www.mangahere.cc", "m.mangahere.cc", "www.mangahere.co", "mangahere.cc"]
    home = "https://www.mangahere.cc/"
    chapter_url = /\/manga\/.*\/.+\/.*/g

    private baseUrl = "https://www.mangahere.cc"

    async getMangaList(search: string) {
        const doc = await this.mirrorHelper.loadPage("https://www.mangahere.cc/search?title=" + search, {
            nocache: true,
            preventimages: true
        })

        const $ = this.parseHtml(doc)

        const res: InfoResult[] = []

        $(".line-list ul .manga-list-4-item-title > a").each(function () {
            res.push([$(this).text().trim(), "https://www.mangahere.cc" + $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga: string) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })

        let $ = this.parseHtml(doc)
        if ($("#checkAdult").length > 0) {
            this.mirrorHelper.setCookie({
                // set the cookie on fanfox domain
                name: "isAdult",
                value: "1",
                path: "/",
                url: urlManga,
                domain: "www.mangahere.cc",
                expirationDate: new Date().getTime() + 24 * 60 * 60 * 1000
            })
            doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
            $ = this.parseHtml(doc)
        }
        const res = []
        $(".detail-main-list a").each(function () {
            let url = "https://www.mangahere.cc" + $(this).attr("href")
            url = url.substr(0, url.lastIndexOf("/") + 1)
            res.push([$(".title3", $(this)).text(), url])
        })
        return res
    }

    async getCurrentPageInfo(doc: string, curUrl: string): Promise<CurrentPageInfo> {
        const mga = this.queryHtml(doc, ".reader-header-title-1 a")
        return {
            name: mga.text(),
            currentMangaURL: this.baseUrl + mga.attr("href"),
            currentChapterURL: curUrl.substr(0, curUrl.lastIndexOf("/") + 1)
        }
    }

    async getListImages(doc: string, curUrl: string) {
        // Check if we have embedded list of images
        if (doc.includes("eval(function")) {
            return this.extractListOfImages(doc)
        }

        const lastpage = this.getVariable({ variableName: "imagecount", doc }),
            curl = curUrl.substr(0, curUrl.lastIndexOf("/") + 1),
            res = []
        for (let i = 1; i <= lastpage; i++) {
            res.push(curl + i + ".html")
        }
        return res
    }

    async getImageUrlFromPage(urlImg: string) {
        // Relative schema url, pass it back.
        if (urlImg.startsWith("//")) {
            // "//zjcdn.mangahere.org/store/manga/39145/001.0/compressed/m000.jpg",
            return urlImg
        }

        // loads the page containing the current scan
        const doc = await this.mirrorHelper.loadPage(urlImg, { crossdomain: true })
        const $ = this.parseHtml(doc)

        const [first] = $("#dm5_key")
        const mkey = first ? ($(first).val() as string) : ""

        const curl = urlImg.substr(0, urlImg.lastIndexOf("/") + 1),
            cid = this.getVariable({ doc, variableName: "chapterid" }),
            chapfunurl = curl + "chapterfun.ashx", // url to retrieve scan url
            curpage = this.getVariable({ doc, variableName: "imagepage" })

        // get scan url (this function seems to work only within DM5, perhaps a control on Referer)
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
                "x-referer": urlImg,
                "X-Requested-With": "XMLHttpRequest",
                Referer: urlImg
            }
        })

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
            let sc = unpack(match[1], match[3], match[4], match[5].split("|"), 0, {}) // call the unpack function
            sc = sc.replace(/\\'/g, "'") // unquote the result
            // the result is another js function containing the data, we mimic here what it does
            // retrieve the variables
            const pix = this.mirrorHelper.getVariableFromScript("pix", sc)
            let pvalue = this.mirrorHelper.getVariableFromScript("pvalue", sc) // array of scan urls (contains current one and next one)
            pvalue = pvalue.map(img => pix + img) // mimic the returned function which rebuilds the url depending on its parts
            return pvalue[0]
        }
        return "error"
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, ".reader-main").length > 0
    }

    /**
     * We have something like this that needs to parse the parameters
     * and return a string that needs to evaluated
     * "var newImgs=['//zjcdn.mangahere.org, ....];var newImginfos=[19715448...];"
     *
     * <script type="text/javascript">
     *             eval(function(p, a, c, k, e, d) {
     *                 e = function(c) {
     *                     return (c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
     *                 }
     *                 ;
     *                 if (!''.replace(/^/, String)) {
     *                     while (c--)
     *                         d[e(c)] = k[c] || e(c);
     *                     k = [function(e) {
     *                         return d[e]
     *                     }
     *                     ];
     *                     e = function() {
     *                         return '\\w+'
     *                     }
     *                     ;
     *                     c = 1;
     *                 }
     *                 ;while (c--)
     *                     if (k[c])
     *                         p = p.replace(new RegExp('\\b' + e(c) + '\\b','g'), k[c]);
     *                 return p;
     *             }('a n=[\'//7.9.8/5/2/1/6.0/4/o.3\',\'//7.9.8/5/2/1/6.0/4/l.3\',\'//7.9.8/5/2/1/6.0/4/m.3\',\'//7.9.8/5/2/1/6.0/4/r.3\',\'//7.9.8/5/2/1/6.0/4/s.3\',\'//7.9.8/5/2/1/6.0/4/p.3\',\'//7.9.8/5/2/1/6.0/4/q.3\',\'//7.9.8/5/2/1/6.0/4/k.3\',\'//7.9.8/5/2/1/6.0/4/e.3\',\'//7.9.8/5/2/1/6.0/4/f.3\',\'//7.9.8/5/2/1/6.0/4/c.3\',\'//7.9.8/5/2/1/6.0/4/d.3\',\'//7.9.8/5/2/1/6.0/4/i.3\',\'//7.9.8/5/2/1/6.0/4/j.3\',\'//7.9.8/5/2/1/6.0/4/g.3\',\'//7.9.8/5/2/1/6.0/4/h.3\',\'//7.9.8/5/2/1/6.0/4/C.3\'];a u=[v,A,B,y,z,x,w,H,I,J,E,D,G,F,t,b,b];', 46, 46, '|39145|manga|jpg|compressed|store|001|zjcdn|org|mangahere|var|19715468|m010|m011|m008|m009|m014|m015|m012|m013|m007|m001|m002|newImgs|m000|m005|m006|m003|m004|19715466|newImginfos|19715448|19715454|19715453|19715451|19715452|19715449|19715450|m315|19715460|19715458|19715464|19715462|19715455|19715456|19715457'.split('|'), 0, {}))
     *         </script>
     * @param doc
     * @private
     */
    private async extractListOfImages(doc: string): Promise<string[]> {
        const regex = /}\('(.*)\)\)/g

        const match = regex.exec(doc)
        // Matching group should be indexed 1
        if (!match || match.length < 2) {
            return []
        }

        const first = match[1]
        const variableExtraction = /(^.*;',)(\d*),(\d*),'(.*)'.split/g
        const variableMatch = variableExtraction.exec(first)

        if (!variableMatch || variableMatch.length < 5) {
            return []
        }
        // var a = [...], 46, 46, '|39145|manga|...'.split('|') ,0,{}
        const [_initialMatch, variables, x, y, imageList] = variableMatch
        const list = imageList.split("|")
        const data = this.generateStringVariables(variables, x, y, list, 0, {})

        const imgExtract = [...data.matchAll(/'(.+?)\\'/g)]

        return imgExtract.map(r => r[1])
    }

    // Direct copy of function from embedded <scrip> tag
    private generateStringVariables(p, a, c, k, e, d) {
        e = function (c) {
            return (
                (c < a ? "" : e(parseInt(String(c / a)))) +
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
}
