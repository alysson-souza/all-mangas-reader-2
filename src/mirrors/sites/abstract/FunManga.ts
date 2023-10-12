import { BaseMirror } from "./BaseMirror"
import { CurrentPageInfo, InfoResult, MirrorImplementation, MirrorObject } from "../../../types/common"
import { LoadOptions, MirrorHelper } from "../../MirrorHelper"

const defaultOptions = {
    search_url: "http://funmanga/",
    search_data_field: "search",
    search_a_sel: ".manga-title a",
    search_default_data: {},
    sendDataAsText: false,
    chapters_a_sel: "ul.chapter-list li > a",
    page_container_sel: "body > .content",
    img_sel: "img#chapter_img"
}

class FunManga extends BaseMirror implements MirrorImplementation {
    canListFullMangas = false

    chapter_url: RegExp
    domains: string[]
    home: string
    languages: string
    mirrorIcon: string
    mirrorName: string
    disabled: boolean | undefined

    private readonly options: typeof defaultOptions

    constructor(mirrorHelper: MirrorHelper, mirror: MirrorObject, options: Partial<typeof defaultOptions> = {}) {
        super(mirrorHelper)

        this.mirrorName = mirror.mirrorName
        this.mirrorIcon = mirror.mirrorIcon
        this.domains = mirror.domains
        this.home = mirror.home
        this.chapter_url = mirror.chapter_url
        this.languages = mirror.languages
        this.disabled = mirror.disabled

        this.options = {
            ...defaultOptions,
            ...options
        }
    }

    public async getMangaList(search?: string): Promise<InfoResult[]> {
        const opts: LoadOptions = {
            nocache: true,
            preventimages: true,
            post: true,
            data: this.options.search_default_data
        }
        opts.data[this.options.search_data_field] = search
        if (this.options.sendDataAsText) {
            // let str = ""
            // for (let dt in Object.entries(opts.data) {
            //   str += "&" + dt + "=" + opts.data[dt]
            // }
            const params = new URLSearchParams()
            Object.entries(opts.data).forEach(([k, v]) => {
                params.append(k, v)
            })
            opts.data = params
            opts.headers = {}
            opts.headers["X-Requested-With"] = "XMLHttpRequest"
        }

        let doc = await this.mirrorHelper.loadPage(this.options.search_url, opts)
        const $ = this.parseHtml(doc)
        let res: InfoResult[] = []
        $(this.options.search_a_sel).each(function (index) {
            res[index] = [$(this).attr("title").trim(), $(this).attr("href")]
        })
        return res
    }

    public async getListChaps(urlManga: string) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        let res = []
        const $ = this.parseHtml(doc)
        $(this.options.chapters_a_sel).each(function () {
            res[res.length] = [$(".val", $(this)).text().trim(), $(this).attr("href")]
        })
        return res
    }

    public async getCurrentPageInfo(doc: string, curUrl: string): Promise<CurrentPageInfo> {
        const mangaurl = this.mirrorHelper.getVariableFromScript("manga_url", doc)
        let mgname
        const $ = this.parseHtml(doc)
        if ($(`a[href='${mangaurl}']`).length > 0) {
            mgname = $("a[href='" + mangaurl + "']").text()
        }
        if (mgname === undefined || mgname.trim() === "") {
            let docmg = await this.mirrorHelper.loadPage(mangaurl)
            mgname = this.queryHtml(docmg, ".panel-heading h1").text()
        }
        return {
            name: mgname,
            currentMangaURL: mangaurl,
            currentChapterURL: this.getVariable({ doc, variableName: "chapter_url" })
        }
    }

    public async getListImages(doc: string): Promise<string[]> {
        const regex = /ts_reader\.run\((.*?)\);/g
        const parts = doc.match(regex)
        console.error({ doc, regex, parts })
        console.error("HELLLLLLLLLLL")
        if (parts) {
            let json = JSON.parse(parts[0].replace("ts_reader.run(", "").replace(");", ""))
            return json.map(obj => obj.url)
        }

        const images: { url: string }[] = this.mirrorHelper.getVariableFromScript("images", doc)
        return images.map(obj => obj.url)
    }

    public async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }

    isCurrentPageAChapterPage(doc: string): boolean {
        return this.queryHtml(doc, this.options.img_sel).length > 0
    }
}

export const getFunMangaImplementations = (mirrorHelper: MirrorHelper): MirrorImplementation[] => {
    return [
        new FunManga(
            mirrorHelper,
            {
                mirrorName: "FunManga",
                canListFullMangas: true,
                mirrorIcon: require("../../icons/funmanga-optimized.png"),
                languages: "en",
                domains: ["funmanga.com"],
                home: "http://www.funmanga.com",
                chapter_url: /^\/.*\/[0-9]+\.?[0-9]*\/.+$/g
            },
            {
                search_url: "http://www.funmanga.com/service/advanced_search",
                search_data_field: "manga-name",
                search_a_sel: ".manga-title a",
                search_default_data: {
                    type: "all",
                    status: "both",
                    "author-name": "",
                    "artist-name": ""
                },
                sendDataAsText: true,
                chapters_a_sel: "ul.chapter-list li > a",
                page_container_sel: "body > .amr-container"
            }
        ),
        new FunManga(
            mirrorHelper,
            {
                mirrorName: "MangaInn",
                canListFullMangas: true,
                mirrorIcon: require("../../icons/mangainn-optimized.png"),
                languages: "en",
                domains: ["mangainn.net"],
                home: "http://www.mangainn.net",
                chapter_url: /^\/.*\/[0-9]+\.?[0-9]*\/.+$/g
            },
            {
                search_url: "http://www.mangainn.net/service/advanced_search",
                search_data_field: "manga-name",
                search_a_sel: ".manga-title a",
                search_default_data: {
                    type: "all",
                    status: "both",
                    "author-name": "",
                    "artist-name": ""
                },
                sendDataAsText: true,
                chapters_a_sel: "ul.chapter-list li > a",
                page_container_sel: "body > .amr-container"
            }
        ),

        // Not working as expected...
        new FunManga(
            mirrorHelper,
            {
                mirrorName: "ReadMangaToday",
                canListFullMangas: true,
                mirrorIcon: require("../../icons/readmangatoday-optimized.png"),
                languages: "en",
                domains: ["readmng.com"],
                home: "https://www.readmng.com/",
                chapter_url: /^\/.*\/[0-9]+\.?.+$/g
            },
            {
                search_url: "https://www.readmng.com/search",
                search_data_field: "query",
                search_a_sel: ".content-list .title a",
                chapters_a_sel: "ul.chp_lst li > a",
                img_sel: ".readercontent"
            }
        )
    ]
}
