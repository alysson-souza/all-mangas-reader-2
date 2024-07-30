import { BaseMirror } from "../abstract/BaseMirror"
import { CurrentPageInfo, MirrorImplementation, MirrorObject } from "../../../types/common"
import { MirrorHelper } from "../../MirrorHelper"
import AsuraScansIcon from "../../icons/asurascans-optimized.png"
import FlameScanIcon from "../../icons/flamescans-optimized.png"
import KiryuuIcon from "../../icons/kiryuu-optimized.png"
import KomikavIcon from "../../icons/komikav-optimized.png"
import KomicastIcon from "../../icons/komicast-optimized.png"
import KomikstationIcon from "../../icons/komikstation-optimized.png"
import KomikuIcon from "../../icons/komiku-optimized.png"
import NgomikIcon from "../../icons/ngomik-optimized.png"
import VoidScanIcon from "../../icons/voidscans-optimized.png"
import WestMangaIcon from "../../icons/westmanga-optimized.png"
import ReaperScansFake from "../../icons/reaperscans-optimized.png"

const defaultOptions = {
    search_a_sel: "div.bsx > a",
    chapters_a_sel: "div.cl > ul > li > span.leftoff > a",
    chapters_text_sel: "",
    page_container_sel: "#readerarea",
    search_field: "s",
    search_option: "",
    manga_url_sel: "div.allc > a",
    img_sel: "#readerarea img",
    chapter_url_suffix: "",
    manga_title_attr: true,
    manga_name_replace: "",
    img_src: "src",
    search_json: true,
    flame_scans_fuckery: false,
    fixChapterUrl: input => input,
    fixSeriesUrl: input => input,
    doBefore: () => {},
    search_url: ""
}

/**
 * Abstract implementation for all sites based on MangaStream theme https://mangastream.themesia.com/
 */
class MangaStream extends BaseMirror implements MirrorImplementation {
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

    async getMangaList(search) {
        const self = this
        const searchApiUrl = this.options.search_url + "wp-admin/admin-ajax.php"

        if (this.options.search_json) {
            const json = await this.mirrorHelper.loadJson(searchApiUrl, {
                nocache: true,
                post: true,
                headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-type": "application/x-www-form-urlencoded"
                },
                data: {
                    action: "ajaxy_sf",
                    sf_value: search,
                    search: "false"
                }
            })

            const res = []
            const mangas = json.manga[0].all
            for (const i in mangas) {
                const item = mangas[i]
                res.push([item["post_title"], self.options.fixSeriesUrl(item["post_link"])])
            }
            return res
        }

        const urlManga =
            this.options.search_url + `?${this.options.search_field}=` + search + this.options.search_option
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const $ = this.parseHtml(doc)

        const res = []
        $(this.options.search_a_sel, doc).each(function (index) {
            res[res.length] = [
                self.options.manga_title_attr ? $(this).attr("title") : $(this).text().trim(),
                self.options.fixSeriesUrl($(this).attr("href"))
            ]
        })
        return res
    }

    async getListChaps(urlManga) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const _self = this

        const $ = this.parseHtml(doc)

        var res = []
        $(this.options.chapters_a_sel, doc).each(function (index) {
            let chapter_text = $(this).text().trim()
            if (_self.options.chapters_text_sel !== "") {
                chapter_text = $(_self.options.chapters_text_sel, this).text().trim()
            }

            const chapter_url = _self.options.fixChapterUrl($(this).attr("href") + _self.options.chapter_url_suffix)
            res.push([chapter_text, chapter_url])
        })

        // console.debug('Chapter list', res)
        return res
    }

    async getCurrentPageInfo(doc, curUrl): Promise<CurrentPageInfo> {
        const $ = this.parseHtml(doc)
        const manga_url = $(this.options.manga_url_sel, doc).attr("href")
        const manga_name = $(this.options.manga_url_sel, doc).text()

        return {
            name: manga_name.replace(this.options.manga_name_replace, "").trim(),
            currentMangaURL: this.options.fixSeriesUrl(manga_url),
            currentChapterURL: this.options.fixChapterUrl(curUrl)
        }
    }

    async getListImages(doc) {
        const name = this.options.img_src
        const $ = this.parseHtml(doc)
        const res: string[] = []
        $(this.options.img_sel, doc).each(function (index) {
            res[res.length] = $(this).attr(name)
        })
        return res
    }

    async getImageUrlFromPage(urlImg: string) {
        return urlImg
    }

    isCurrentPageAChapterPage(doc) {
        // console.debug(doc, this.options.page_container_sel, this.queryHtml(doc, this.options.page_container_sel))
        return this.queryHtml(doc, this.options.page_container_sel).length > 0
    }
}

export const getMangaStreamImplementations = (mirrorHelper: MirrorHelper): MirrorImplementation[] => {
    return [
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Asura Scans",
                canListFullMangas: false,
                mirrorIcon: AsuraScansIcon,
                domains: [
                    "www.asurascans.com",
                    "asura.gg",
                    "asura.nacm.xyz",
                    "asuracomics.com",
                    "asuracomics.gg",
                    "asuratoon.com",
                    "asuracomic.net"
                ],
                home: "https://asuracomic.net",
                // chapter_url: /\/.*?(chapter|ch)-[0-9]+.*\//g,
                chapter_url: /\/series\/.*\/chapter\/\d+/g,
                languages: "en"
            },
            {
                search_url: "https://asuracomic.net/series",
                chapters_a_sel: "h3.text-sm a",
                // chapters_text_sel: "span.chapternum",
                search_json: false,
                img_sel: `img[alt="chapter"]`,
                img_src: "src",
                page_container_sel: `img[alt="chapter"]`,
                manga_url_sel: `p:contains('All chapters are in') a`,
                flame_scans_fuckery: true,
                fixSeriesUrl: url => {
                    if (!url.includes("https://asuracomic.net")) {
                        url = "https://asuracomic.net" + url
                    }
                    return url
                },
                fixChapterUrl: url => {
                    if (!url.includes("https://asuracomic.net")) {
                        url = "https://asuracomic.net/series/" + url
                    }
                    return url
                }
            }
        ),
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Flame Scans",
                canListFullMangas: false,
                mirrorIcon: FlameScanIcon,
                domains: ["flamescans.org", "flamecomics.com", "flamecomics.me"],
                home: "https://flamecomics.me",
                chapter_url: /\/.*?chapter-[0-9]+.*\//g,
                languages: "en"
            },
            {
                search_url: "https://flamecomics.me",
                chapters_a_sel: "div.bixbox.bxcl ul li a",
                chapters_text_sel: "span.chapternum",
                search_json: false,
                img_sel: `#readerarea img[width!="1px"][class*="size-"]`,
                img_src: "src",
                fixChapterUrl: origUrl => {
                    const parts = origUrl.split("/")

                    if (parts.length > 5) {
                        parts.splice(3, 1)
                    }

                    const parts2 = parts[3].split("-")

                    if (!isNaN(parts2[0]) && !isNaN(parseFloat(parts2[0]))) parts2.shift()

                    parts[3] = parts2.join("-")
                    return parts.join("/")
                },
                fixSeriesUrl: origUrl => {
                    const parts = origUrl.split("/")
                    if (parts[3] !== "series") {
                        parts.splice(3, 1)
                    }

                    const parts2 = parts[4].split("-")

                    if (!isNaN(parts2[0]) && !isNaN(parseFloat(parts2[0]))) parts2.shift()

                    parts[4] = parts2.join("-")
                    return parts.join("/")
                }
            }
        ),
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Kiryuu",
                canListFullMangas: false,
                mirrorIcon: KiryuuIcon,
                domains: ["kiryuu.co", "kiryuu.id"],
                home: "https://kiryuu.id/",
                chapter_url: /^\/m[0-9]+\/$/g,
                languages: "id"
            },
            {
                search_url: "https://kiryuu.id/",
                chapters_a_sel: "#chapterlist li .eph-num a",
                chapters_text_sel: ".chapternum",
                img_sel: ".wp-post-image",
                img_src: "data-lazy-src",
                search_json: false
            }
        ),
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Komikav",
                canListFullMangas: false,
                mirrorIcon: KomikavIcon,
                domains: ["komikav.com"],
                home: "https://komikav.com/",
                chapter_url: /^\/m[0-9]+\/$/g,
                languages: "id"
            },
            {
                search_url: "https://komikav.com/",
                chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a"
            }
        ),
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Komicast",
                canListFullMangas: false,
                mirrorIcon: KomicastIcon,
                domains: ["komikcast.com", "komikcast.me", "komikcast.site"],
                home: "https://komikcast.site/",
                chapter_url: /^\/chapter\/.+$/g,
                languages: "id"
            },
            {
                search_url: "https://komikcast.site/",
                search_json: false,
                search_a_sel: "div.list-update_item > a",
                chapters_a_sel: "div.komik_info-chapters a.chapter-link-item",
                page_container_sel: ".main-reading-area",
                img_sel: ".main-reading-area img"
            }
        ),

        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Komikstation",
                canListFullMangas: false,
                mirrorIcon: KomikstationIcon,
                domains: ["komikstation.com"],
                home: "https://www.komikstation.com/",
                chapter_url: /chapter-[0-9]+\/$/g,
                languages: "id"
            },
            {
                search_url: "https://www.komikstation.com/",
                chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a",
                search_a_sel: " div.allgreen.genrelst > ul > li> div > div.left > a",
                search_option: "&post_type=manga",
                manga_title_attr: true,
                manga_url_sel: "div.chapterbody > div > article > div.headpost a"
            }
        ),
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Komiku",
                canListFullMangas: false,
                mirrorIcon: KomikuIcon,
                domains: ["komiku.co"],
                home: "https://komiku.co/",
                chapter_url: /^\/m[0-9]+\/$/g,
                languages: "id"
            },
            {
                search_url: "https://komiku.co/",
                search_a_sel: "h4.newsjudul > a",
                search_option: "&post_type=manga",
                manga_title_attr: false,
                page_container_sel: "#readerareaimg",
                manga_url_sel: "#hot > p > a",
                chapters_a_sel: "td.judulseries > a",
                manga_name_replace: "Manga",
                img_sel: "#readerareaimg img",
                search_json: false
            }
        ),
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Ngomik",
                canListFullMangas: false,
                mirrorIcon: NgomikIcon,
                domains: ["ngomik.in"],
                home: "https://ngomik.in/",
                chapter_url: /^\/m[0-9]+\/$/g,
                languages: "id"
            },
            {
                search_url: "https://ngomik.in/",
                search_a_sel: "div.luf > a",
                chapters_a_sel: "div.lch> a"
            }
        ),
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Void Scans",
                mirrorIcon: VoidScanIcon,
                languages: "en",
                domains: ["void-scans.com", "hivescans.com"],
                home: "https://hivescans.com/",
                chapter_url: /^\/.+chapter-\d+/g,
                canListFullMangas: false
            },
            {
                search_url: "https://hivescans.com/",
                chapters_a_sel: "div.bixbox.bxcl ul li a",
                chapters_text_sel: "span.chapternum",
                // img_src: "data-lazy-src",
                img_src: "src",
                fixChapterUrl: url => {
                    const parts = url.split("/")
                    if (parts[3] == "1") parts.splice(3, 1)
                    return parts.join("/")
                }
            }
        ),
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Westmanga",
                canListFullMangas: false,
                mirrorIcon: WestMangaIcon,
                domains: ["westmanga.info"],
                home: "https://westmanga.info/",
                chapter_url: /^\/m[0-9]+\/$/g,
                languages: "id"
            },
            {
                search_url: "https://westmanga.info/",
                search_a_sel: "div.kanan_search > header > span > a",
                search_option: "&post_type=manga",
                manga_title_attr: false,
                chapters_a_sel: "div.cl > ul > li > span.leftoff > a",
                search_json: false
            }
        ),
        new MangaStream(
            mirrorHelper,
            {
                mirrorName: "Reaper Scans (Fake)",
                canListFullMangas: false,
                mirrorIcon: ReaperScansFake,
                domains: ["reaper-scans.com"],
                home: "https://reaper-scans.com",
                chapter_url: /\/.*?chapter-[0-9]+.*\//g,
                languages: "en"
            },
            {
                search_url: "reaper-scans.com",
                chapters_a_sel: "div.bixbox.bxcl ul li a",
                chapters_text_sel: "span.chapternum",
                search_json: false
            }
        )
    ]
}
