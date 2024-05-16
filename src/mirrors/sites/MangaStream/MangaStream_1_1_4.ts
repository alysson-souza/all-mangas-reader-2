import { BaseMirror } from "../abstract/BaseMirror"
import { MirrorImplementation, MirrorObject } from "../../../types/common"
import { MirrorHelper } from "../../MirrorHelper"
import AzureMangaIcon from "../../icons/azuremanga-optimized.png"
import LiminousScanIcon from "../../icons/luminousscans-optimized.png"
import ManhwaxIcon from "../../icons/manhwax-optimized.png"
import NightScansIcon from "../../icons/night-scans-optimized.png"
import NocturalScansIcon from "../../icons/nocturnal-scans-optimized.png"
import AnigliScansIcon from "../../icons/anigli-scans-optimized.png"

const defaultOptions = {
    base_url: "",
    series_list_selector: '.listupd a[href*="/manga/"]',
    chapter_list_selector: ".eph-num a",
    manga_url_selector: ".allc a",
    img_sel: "#readerarea img",
    urlProcessorSeries: url => url,
    urlProcessorChapter: url => url
}

export class MangaStream_1_1_4 extends BaseMirror implements MirrorImplementation {
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

    public async getMangaList(search: string) {
        const res = []
        const urlManga = this.options.base_url + "?s=" + search
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const self = this
        const $ = this.parseHtml(doc)
        $(this.options.series_list_selector, doc).each(function (index) {
            res.push([$(this).find(".tt").text().trim(), self.options.urlProcessorSeries($(this).attr("href"))])
        })
        return res
    }

    public async getListChaps(urlManga: string) {
        const doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        const res = []
        const self = this
        const $ = this.parseHtml(doc)
        $(this.options.chapter_list_selector, doc).each(function (index) {
            res.push([$(".chapternum", this).text().trim(), self.options.urlProcessorChapter($(this).attr("href"))])
        })
        return res
    }

    public async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        const title = $(this.options.manga_url_selector, doc)
        return {
            name: title.text(),
            currentMangaURL: this.options.urlProcessorSeries(title.attr("href")),
            currentChapterURL: this.options.urlProcessorChapter(curUrl)
        }
    }

    public async getListImages(doc) {
        const res = []
        const regex = /ts_reader\.run\((.*?)\);/g
        const parts = doc.match(regex)

        if (!Array.isArray(parts) || parts.length === 0) {
            const $ = this.parseHtml(doc)
            const res: string[] = []
            $(this.options.img_sel, doc).each(function (index) {
                res[res.length] = $(this).attr("src")
            })
            return res
        }

        const json = JSON.parse(parts[0].replace("ts_reader.run(", "").replace(");", ""))

        for (const source of json.sources) {
            // Only need one source, as others are duplicate
            if (source.images) {
                return source.images
            }
        }
        return res
    }

    public async getImageUrlFromPage(urlImg) {
        return urlImg
    }

    public isCurrentPageAChapterPage(doc: string) {
        return this.queryHtml(doc, "div#readerarea").length > 0
    }
}

export const getMangaStream114Implementations = (mirrorHelper: MirrorHelper): MirrorImplementation[] => {
    return [
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Azure Manga",
                canListFullMangas: false,
                mirrorIcon: AzureMangaIcon,
                domains: ["azuremanga.com"],
                home: "https://azuremanga.com/",
                chapter_url: /.\d+.+\//g,
                languages: "en"
            },
            {
                base_url: "https://azuremanga.com/"
            }
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Luminous Scans",
                canListFullMangas: false,
                mirrorIcon: LiminousScanIcon,
                domains: ["luminousscans.gg", "luminousscans.net", "lumitoon.com", "luminouscomics.org"],
                home: "https://luminouscomics.org/",
                chapter_url: /chapter-[0-9]+.*\/$/g,
                languages: "en"
            },
            {
                chapter_list_selector: "#chapterlist .eph-num a",
                urlProcessorSeries: url => {
                    const parts = url.split("/")
                    const parts2 = parts[5].split("-")

                    if (!isNaN(parts2[0]) && !isNaN(parseFloat(parts2[0]))) parts2.shift()

                    parts[5] = parts2.join("-")
                    return parts.join("/")
                }
            }
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Manhwax",
                mirrorIcon: ManhwaxIcon,
                languages: "en",
                domains: ["manhwax.com"],
                home: "https://manhwax.com/",
                chapter_url: /\/.*?chapter-[0-9]+.*\//g
            },
            {
                base_url: "https://manhwax.com/"
            }
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Night Scans",
                canListFullMangas: false,
                mirrorIcon: NightScansIcon,
                domains: ["nightscans.org", "nightscans.net", "night-scans.com"],
                home: "https://night-scans.com",
                chapter_url: /\/.*?-[0-9]+.*\//g,
                languages: "en"
            },
            {
                // search_url: "https://nightscans.org",
                chapter_list_selector: "#chapterlist .eph-num a"
            }
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Nocturnal Scans",
                canListFullMangas: false,
                mirrorIcon: NocturalScansIcon,
                domains: ["nocturnalscans.com"],
                home: "https://nocturnalscans.com",
                chapter_url: /\/.*?-[0-9]+.*\//g,
                languages: "en"
            },
            {
                // search_url: "https://nocturnalscans.com",
                chapter_list_selector: "#chapterlist .eph-num a"
            }
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Animated Glitched Scans",
                canListFullMangas: false,
                mirrorIcon: AnigliScansIcon,
                domains: ["anigliscans.com", "anigliscans.xyz"],
                home: "https://anigliscans.xyz",
                chapter_url: /.*/g,
                languages: "en"
            },
            {
                // search_url: "https://anigliscans.xyz"
            }
        ),
        // From the same team as "Animated Glitched Scans". That's why it shares the same icon (for now probably)
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Animated Glitched Comics",
                canListFullMangas: false,
                mirrorIcon: AnigliScansIcon,
                domains: ["agscomics.com"],
                home: "https://agscomics.com",
                chapter_url: /.*/g,
                languages: "en"
            },
            {
                chapter_list_selector: "#chapterlist .eph-num a"
            }
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Lynx Scans",
                mirrorIcon: require("../../icons/lynxscans-optimized.png"),
                languages: "en",
                domains: ["lynxscans.com"],
                home: "https://lynxscans.com/home",
                canListFullMangas: true,
                chapter_url: /^\/*\/.+$/g
            },
            {}
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Rizz Comic",
                canListFullMangas: false,
                mirrorIcon: require("../../icons/rizz-comic-optimized.png"),
                domains: ["rizzcomic.com", "rizzfables.com"],
                home: "https://rizzfables.com",
                chapter_url: /chapter-[0-9]/g,
                languages: "en"
            },
            {
                // search_url: "https://realmscans.xyz/",
                // series_list_selector: '.listupd a[href*="/series/"]',
                chapter_list_selector: `.eph-num a[href*="rizzfables.com"]`
            }
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Astra Scans",
                canListFullMangas: false,
                mirrorIcon: require("../../icons/astra-scans-optimized.png"),
                domains: ["astrascans.com"],
                home: "https://astrascans.com/",
                chapter_url: /\-chapter\-\d.+\//g,
                languages: "en"
            },
            {
                base_url: "https://astrascans.com/",
                urlProcessorChapter: url => {
                    const parts = url.split("/")
                    if (parts[3] == "10000") parts.splice(3, 1)
                    return parts.join("/")
                }
            }
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Surya Toon",
                mirrorIcon: require("../../icons/surya-toon-optimized.png"),
                languages: "en",
                domains: ["suryatoon.com"],
                home: "https://suryatoon.com",
                // canListFullMangas: true,
                chapter_url: /^\/*\/.+$/g
            },
            {}
        ),
        new MangaStream_1_1_4(
            mirrorHelper,
            {
                mirrorName: "Manga Galaxy",
                mirrorIcon: require("../../icons/manga-galaxy-optimized.png"),
                languages: "en",
                domains: ["mangagalaxy.me"],
                home: "https://mangagalaxy.me",
                // canListFullMangas: true,
                chapter_url: /^\/*\/.+$/g
            },
            {}
        )
    ]
}
