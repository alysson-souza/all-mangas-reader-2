import { BaseMirror } from "./BaseMirror"
import { MirrorImplementation, MirrorObject } from "../../../types/common"
import { MirrorHelper } from "../../MirrorHelper"
import { CheerioAPI } from "cheerio"
import MangakakalotIcon from "../../icons/mangakakalot-optimized.png"
import ManganeloIcon from "../../icons/manganelo-optimized.png"

const defaultOptions = {
    base_url: "",
    search_url: "search/story/",
    series_list_selector: ".story_name a",
    series_list_page_last_selector: "a.page_last",
    chapter_list_selector: ".chapter-list a",
    chapter_information_selector: ".breadcrumb:first > p > :nth-child(3) a",
    images_selector: ".container-chapter-reader img"
}

export class MangakakalotAbs extends BaseMirror implements MirrorImplementation {
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
            base_url: mirror.home,
            ...options
        }
    }

    async getMangaList(search) {
        search = search.replace(/ /g, "_")
        let res = []
        let url = this.options.base_url + this.options.search_url + search
        let doc = await this.mirrorHelper.loadPage(url, { nocache: true, preventimages: true })

        const $ = this.parseHtml(doc)
        res.push(...this.searchPage($))

        const lastPage = $(this.options.series_list_page_last_selector)
        if (lastPage.length > 0) {
            const pageCount = parseInt(new URLSearchParams(new URL(lastPage.attr("href")).search).get("page")) || 2
            for (let i = 2; i <= pageCount; i++) {
                doc = await this.mirrorHelper.loadPage(url + "?page=" + i, { nocache: true, preventimages: true })
                res.push(...this.searchPage(this.parseHtml(doc)))
            }
        }

        return res
    }

    /** Receive parsed html, to a ovoid doing it multiple times **/
    searchPage($: CheerioAPI) {
        const self = this
        const res = []

        $(this.options.series_list_selector).each(function () {
            if (!$(this).attr("href").includes(self.options.base_url)) {
                // This is because multiple sites can be linked to each other
                return
            }
            res.push([$(this).text().trim(), $(this).attr("href")])
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        const $ = this.parseHtml(doc)

        $(this.options.chapter_list_selector).each(function (index) {
            res.push([$(this).text(), $(this).attr("href")])
        })

        return res
    }

    async getCurrentPageInfo(doc: string, curUrl: string) {
        const link = this.queryHtml(doc, this.options.chapter_information_selector)
        return {
            name: link.text(),
            currentMangaURL: link.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl) {
        const res = []
        const $ = this.parseHtml(doc)
        $(this.options.images_selector).each(function () {
            res.push($(this).attr("src"))
        })
        return res
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }

    isCurrentPageAChapterPage(doc: string, curUrl: string): boolean {
        // this used to return promise in the original implementation
        // without await, therefore was always tread as truthful
        return this.chapter_url.test(curUrl)
    }
}

/**
 * All implementations based of Mangakakalot are placed here
 * avoids the need to create new file for each implementation
 */
export const getMangaKakalotImplementations = (mirrorHelper: MirrorHelper): MirrorImplementation[] => {
    return [
        new MangakakalotAbs(mirrorHelper, {
            mirrorName: "Mangakakalot",
            mirrorIcon: MangakakalotIcon,
            languages: "en",
            domains: ["mangakakalot.com"],
            home: "https://mangakakalot.com/",
            chapter_url: /^\/chapter\/.*\/.+$/g
        }),
        new MangakakalotAbs(
            mirrorHelper,
            {
                mirrorName: "Manganelo",
                mirrorIcon: ManganeloIcon,
                languages: "en",
                domains: [
                    "manganato.com",
                    "chap.manganato.com",
                    "m.manganato.com",
                    "readmanganato.com",
                    "m.manganelo.com",
                    "chap.manganelo.com"
                ],
                home: "https://manganato.com/",
                chapter_url: /^\/manga-.*\/chapter-\d+.*$/g
            },
            {
                series_list_selector: ".search-story-item a.item-title",
                chapter_list_selector: ".row-content-chapter a",
                chapter_information_selector:
                    '.panel-breadcrumb:first a[href*="/manga/"]:first, .panel-breadcrumb:first a[href*="/manga-"]:first',
                images_selector: ".container-chapter-reader img"
            }
        )
    ]
}
