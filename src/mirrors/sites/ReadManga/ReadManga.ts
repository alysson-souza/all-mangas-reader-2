import { BaseMirror } from "../abstract/BaseMirror"
import { CurrentPageInfo, InfoResult, MirrorImplementation, MirrorObject, Sender } from "../../../types/common"
import { MirrorHelper } from "../../MirrorHelper"

const defaultOptions = {
    base_url: ""
}

class ReadManga extends BaseMirror implements MirrorImplementation {
    canListFullMangas: boolean
    chapter_url: RegExp
    disabled: boolean
    domains: string[]
    home: string
    languages: string
    mirrorIcon: string
    mirrorName: string

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
            base_url: mirror.home,
            ...options
        }
    }

    public async getCurrentPageInfo(doc: string, curUrl: string): Promise<CurrentPageInfo> {
        const $ = this.parseHtml(doc)
        const content = $("#mangaBox h1 a:first-child").contents()[0]
        const name = $(content).text()
        const nameurl = this.options.base_url + $("#mangaBox h1 a:first-child", doc).attr("href")
        const chapurl = curUrl.split("?")[0] + "?mtr=1"
        return {
            name: name,
            currentMangaURL: nameurl,
            currentChapterURL: chapurl
        }
    }

    public async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }

    public async getListChaps(urlManga: string): Promise<InfoResult[] | Record<string, InfoResult[]>> {
        const doc = await this.mirrorHelper.loadPage(`${urlManga}?mtr=1`, { nocache: true, preventimages: true })
        const mangaIdFromUrl = urlManga.split("/").pop()
        const res = []
        const self = this

        const $ = this.parseHtml(doc)

        $("div.chapters a.chapter-link").each(function () {
            const elements = $(this)
            let str = elements.attr("href")
            str = str.split("/")[1]
            if (str === mangaIdFromUrl) {
                let nameParts = elements
                    .text()
                    .match(/^\s*\S.*$/gm)
                    .map(name => name.trim())
                if (nameParts[nameParts.length - 1] === "новое") {
                    nameParts.pop()
                }
                const chapterName = nameParts[nameParts.length - 1]
                res[res.length] = [chapterName, self.options.base_url + elements.attr("href")]
            }
        })
        return res
    }

    public async getListImages(doc: string, curUrl: string, sender: Sender): Promise<string[]> {
        doc = await this.passAdult(doc, curUrl)

        const res = []
        const matches = doc.match(/rm_h\.(?:initReader|readerInit)\(.*?(\[\[.*?\]\])/)

        if (matches) {
            const hasOneWayImageServer = doc.includes("https://one-way.work")
            const jsonString = matches[1].replace(/'/g, '"')
            const b = JSON.parse(jsonString)
            for (let i = 0; i < b.length; i++) {
                if (hasOneWayImageServer) {
                    res[i] = "https://one-way.work/" + b[i][2].replace(/\?.*$/, "")
                } else {
                    res[i] = b[i][0] + b[i][2]
                }
            }
        }
        return res
    }

    public async getMangaList(search?: string): Promise<InfoResult[]> {
        const json = await this.mirrorHelper.loadJson(`${this.options.base_url}search/suggestion`, {
            nocache: true,
            method: "GET",
            // dataType: "text",
            data: {
                query: search
            }
        })
        let res = []
        for (let sug of json.suggestions) {
            if (!sug.link.includes("/", 1)) {
                res[res.length] = [sug.value, this.options.base_url + sug.link]
            }
        }
        return res
    }

    isCurrentPageAChapterPage(doc: string, curUrl: string): boolean {
        return this.queryHtml(doc, "img#mangaPicture").length > 0
    }

    private async passAdult(doc: string, curUrl: string) {
        if (this.queryHtml(doc, "a[href$='?mtr=1']").length > 0) {
            doc = await this.mirrorHelper.loadPage(curUrl + "?mtr=1")
        }
        return doc
    }
}

export const getReadMangaMirrors = (mirrorHelper: MirrorHelper): MirrorImplementation[] => {
    return [
        new ReadManga(
            mirrorHelper,
            {
                mirrorName: "ReadManga",
                mirrorIcon: require("../../icons/readmanga-optimized.png"),
                languages: "ru",
                domains: ["readmanga.live", "readmanga.io"],
                home: "https://readmanga.live",
                canListFullMangas: false,
                chapter_url: /^\/.*\/vol.*\/[0-9]+.*$/g
            },
            {
                base_url: "https://readmanga.live"
            }
        ),
        new ReadManga(
            mirrorHelper,
            {
                mirrorName: "MintManga",
                mirrorIcon: require("../../icons/mintmanga-optimized.png"),
                languages: "ru",
                domains: ["mintmanga.live"],
                home: "https://mintmanga.live",
                canListFullMangas: false,
                chapter_url: /^\/.*\/vol.*\/[0-9]+.*$/g
            },
            {
                base_url: "https://mintmanga.live"
            }
        )
    ]
}
