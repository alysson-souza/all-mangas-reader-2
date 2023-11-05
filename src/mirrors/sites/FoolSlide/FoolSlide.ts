import { BaseMirror } from "../abstract/BaseMirror"
import { MirrorImplementation, MirrorObject } from "../../../types/common"
import { LoadOptions, MirrorHelper } from "../../MirrorHelper"
import { AnyNode, BasicAcceptedElems, CheerioAPI } from "cheerio"

const defaultOptions = {
    base_url: "http://foo.slide/",
    series_list_url: "/directory/",

    // how to search series : true search for the whole list (if multiple pages, can be heavy),
    // false use the foolslide search function
    search_all: true,
    mglist_nextpage: ".next a:last", // the selector for next page button on series list
    mglist_selector: "a[href*='/series/']", // how to select manga from list

    // while getting manga list, how to get manga title from a element
    mglist_look_title_from_a: (a: BasicAcceptedElems<AnyNode>, $: CheerioAPI) => $(a).text(),

    // while getting chapters list, how to get chapter title from a element
    listchaps_look_title_from_a: (a: BasicAcceptedElems<AnyNode>, $: CheerioAPI) => $(a).text(),
    listchaps_reverse: false,
    info_manga_a: ".tbtitle.dnone a:first",

    // while getting informations from page, how to get manga title from a manga info
    info_look_title_from_a: (a: BasicAcceptedElems<AnyNode>, $: CheerioAPI) => $(a).text(),

    // chapter url is stored in a variable in a script from the page, name of the variable,
    info_chapter_var: "base_url",
    page_container: "#content" // selector for the page container
}

class FoolSlide extends BaseMirror implements MirrorImplementation {
    canListFullMangas = true

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
            base_url: mirror.home,
            ...options
        }
    }

    public async getMangaList(search) {
        if (this.options.search_all) {
            return this.searchPage(this.options.base_url + this.options.series_list_url)
        }
        return this.searchPage(this.options.base_url + "/search/", { post: true, data: { search: search } })
    }

    private async searchPage(url: string, options?: LoadOptions) {
        let res = []
        const self = this
        const doc = await this.mirrorHelper.loadPage(
            url,
            Object.assign({ nocache: true, preventimages: true }, options)
        )
        const $ = this.parseHtml(doc)
        $(this.options.mglist_selector).each(function (index) {
            res[res.length] = [self.options.mglist_look_title_from_a(this, $).trim(), $(this).attr("href")]
        })
        const nextpage_but = $(this.options.mglist_nextpage, doc)
        if (nextpage_but.length > 0) {
            res = [...res, ...(await this.searchPage(nextpage_but.attr("href"), options))]
        }
        return res
    }

    public async getListChaps(urlManga: string) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        doc = await this.passAdult(doc, urlManga)
        const $ = this.parseHtml(doc)
        let res = []
        const _self = this
        $("a[href*='/read/']").each(function () {
            res.push([_self.options.listchaps_look_title_from_a(this, $).trim(), $(this).attr("href")])
        })
        if (this.options.listchaps_reverse) {
            res = res.reverse()
        }
        return res
    }

    public async getCurrentPageInfo(doc, curUrl) {
        doc = await this.passAdult(doc, curUrl)
        const $ = this.parseHtml(doc)
        const mga = $(this.options.info_manga_a)
        const base_url = this.getVariable({ variableName: this.options.info_chapter_var, doc })
        return {
            name: this.options.info_look_title_from_a(mga, $).trim(),
            currentMangaURL: mga.attr("href"),
            currentChapterURL: base_url
        }
    }

    public async getListImages(doc: string, curUrl: string) {
        doc = await this.passAdult(doc, curUrl)
        const pages = this.getVariable({ doc, variableName: "pages" })
        return pages.map(page => page.url)
    }

    /** For some manga, adult reading confirmation is required, lets do it */
    private async passAdult(doc, curUrl) {
        const $ = this.parseHtml(doc)
        if ($("input[name='adult']", doc).length > 0) {
            doc = await this.mirrorHelper.loadPage(curUrl, { post: true, data: { adult: true } })
        }
        return doc
    }

    public async getImageUrlFromPage(urlImg: string) {
        return urlImg
    }

    public isCurrentPageAChapterPage(doc: string) {
        return this.queryHtml(doc, "#page img").length > 0
    }
}

export const getFoolSlideImplementations = (mirrorHelper: MirrorHelper): MirrorImplementation[] => {
    return [
        new FoolSlide(
            mirrorHelper,
            {
                mirrorName: "Death Toll Scans",
                mirrorIcon: require("../../icons/deathtollscans-optimized.png"),
                languages: "en",
                domains: ["reader.deathtollscans.net"],
                home: "https://reader.deathtollscans.net/",
                chapter_url: /^\/read\/.+$/g
            },
            {
                base_url: "https://reader.deathtollscans.net",
                mglist_selector: ".title > a[href*='/series/']"
            }
        ),
        new FoolSlide(
            mirrorHelper,
            {
                mirrorName: "Evil Flowers",
                mirrorIcon: require("../../icons/evilflowers-optimized.png"),
                languages: "en",
                domains: ["reader.evilflowers.com"],
                home: "http://reader.evilflowers.com",
                canListFullMangas: false /* to avoid loading 8 pages to load all mangas */,
                chapter_url: /^\/read\/.+$/g
            },
            {
                base_url: "http://reader.evilflowers.com",
                search_all: false /* use FoolSlide search function */,
                mglist_selector: ".title > a[href*='/series/']"
            }
        ),
        new FoolSlide(
            mirrorHelper,
            {
                mirrorName: "Kangaryu Team",
                mirrorIcon: require("../../icons/kangaryuteam-optimized.png"),
                languages: "fr",
                domains: ["kangaryu-team.fr"],
                home: "http://kangaryu-team.fr/",
                chapter_url: /^\/reader\/read\/.+$/g
            },
            {
                base_url: "http://kangaryu-team.fr/reader",
                mglist_selector: ".title > a[href*='/series/']"
            }
        )
    ]
}
