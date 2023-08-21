import { CurrentPageInfo, InfoResult, MirrorImplementation, MirrorObject, Sender } from "../../../types/common"
import { BaseMirror } from "../abstract/BaseMirror"
import { MirrorHelper } from "../../MirrorHelper"

const defaultOptions = {
    base_url: "https://mymangareadercms/",
    chapters_element: "ul.chapters a[href*='/manga/']",
    img_src: "data-src"
}

class MyMangaReaderCMS extends BaseMirror implements MirrorImplementation {
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
        let name = $("#navbar-collapse-1 > .nav > li > a[href*='/manga/']", doc).text()
        if (name.endsWith("Manga")) {
            name = name.substring(0, name.length - 5).trim()
        }
        const currentMangaURL = $("#navbar-collapse-1 > .nav > li > a[href*='/manga/']").attr("href")
        return {
            name: name,
            currentMangaURL: currentMangaURL,
            currentChapterURL: $("#chapter-list li.active a").attr("href")
        }
    }

    public async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }

    public async getListChaps(urlManga: string): Promise<InfoResult[]> {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res: InfoResult[] = []
        const $ = this.parseHtml(doc)
        $(this.options.chapters_element).each(function () {
            res.push([$(this).text(), $(this).attr("href")])
        })
        return res
    }

    public async getListImages(doc: string, curUrl: string, sender: Sender): Promise<string[]> {
        const self = this
        const res: string[] = []
        const $ = this.parseHtml(doc)
        $("img", $(".viewer-cnt #ppp").prev()).each(function () {
            let src = $(this).attr(self.options.img_src)
            if (src && src !== "") {
                if (src.indexOf("//") === 0) {
                    src = self.protocol() + src
                }
                res.push(src.trim())
            }
        })
        return res
    }

    public async getMangaList(search?: string): Promise<InfoResult[]> {
        const res: InfoResult[] = []
        if (!this.canListFullMangas) {
            const json = await this.mirrorHelper.loadJson(this.options.base_url + "/search?query=" + search, {
                nocache: true
            })
            for (let obj of json.suggestions) {
                res[res.length] = [obj.value, this.options.base_url + "/manga/" + obj.data]
            }
            return res
        }
        const doc = await this.mirrorHelper.loadPage(this.options.base_url + "/manga-list", {
            nocache: true,
            preventimages: true
        })
        const $ = this.parseHtml(doc)
        $("h5.media-heading > a[href*='/manga/']").each(function () {
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    isCurrentPageAChapterPage(doc: string, curUrl: string): boolean {
        return this.queryHtml(doc, "#ppp img.scan-page").length > 0
    }

    protocol() {
        return this.options.base_url.substr(0, this.options.base_url.indexOf("/"))
    }
}

export const getMyMangaReaderCMSMirrors = (mirrorHelper: MirrorHelper): MirrorImplementation[] => {
    return [
        new MyMangaReaderCMS(
            mirrorHelper,
            {
                mirrorName: "Komikid",
                mirrorIcon: require("../../icons/id-optimized.png"),
                languages: "id",
                domains: ["www.komikid.com", "komikid.com"],
                home: "http://www.komikid.com",
                chapter_url: /^\/manga\/.*\/.+$/g
            },
            {
                base_url: "http://www.komikid.com",
                chapters_element: "ul.chapters > li > h5 > a"
            }
        ),
        new MyMangaReaderCMS(
            mirrorHelper,
            {
                mirrorName: "ScanFR",
                mirrorIcon: require("../../icons/scanfr-optimized.png"),
                languages: "fr",
                domains: ["scan-fr.cc", "www.scan-fr.cc", "scan-fr.org", "www.scan-fr.org"],
                home: "https://www.scan-fr.cc",
                chapter_url: /^\/manga\/.*\/.+$/g
            },
            {
                base_url: "https://www.scan-fr.org",
                chapters_element: "ul.chapterszozo a[href*='/manga/']"
            }
        )
    ]
}
