import { BaseMirror } from "./abstract/BaseMirror"
import { CurrentPageInfo, InfoResult, MirrorImplementation } from "../../types/common"
import { mdFixLang } from "../../shared/mangaDexUtil"
import MangaDexIcon from "../icons/mangadex-optimized.png"
import { MirrorHelper } from "../MirrorHelper"

export interface Title {
    en: string
}

export interface Description {
    en: string
}

export interface Links {
    al: string
    ap: string
    kt: string
    mu: string
    amz: string
    mal: string
}

export interface Name {
    en: string
}

export interface TagAttributes {
    name: Name
    description: any[]
    group: string
    version: number
}

export interface Tag {
    id: string
    type: string
    attributes: TagAttributes
    relationships: any[]
}

export interface Attributes {
    title: Title
    altTitles: Record<string, string>[]
    description: Description
    isLocked: boolean
    links: Links
    originalLanguage: string
    lastVolume: string
    lastChapter: string
    publicationDemographic: string
    status: string
    year: number
    contentRating: string
    tags: Tag[]
    state: string
    chapterNumbersResetOnNewVolume: boolean
    createdAt: Date
    updatedAt: Date
    version: number
    availableTranslatedLanguages: string[]
}

export interface Relationship {
    id: string
    type: string
}

export interface MangaData {
    id: string
    type: string
    attributes: Attributes
    relationships: Relationship[]
}

export interface FeedAttributes {
    volume: string
    chapter: string
    title: string
    translatedLanguage: string
    externalUrl?: any
    publishAt: Date
    readableAt: Date
    createdAt: Date
    updatedAt: Date
    pages: number
    version: number
}

export interface FeedData {
    id: string
    type: string
    attributes: FeedAttributes
    relationships: Relationship[]
}

export interface ApiResponse<T> {
    result: string
    response: string
    data: T
}

export interface ApiListResponse<T> extends ApiResponse<T> {
    limit: number
    offset: number
    total: number
}

export class MangadexV5 extends BaseMirror implements MirrorImplementation {
    constructor(mirrorHelper: MirrorHelper) {
        super(mirrorHelper)
    }

    mirrorName = "MangaDex V5"
    canListFullMangas = false
    mirrorIcon = MangaDexIcon
    languages = [
        "en",
        "sa",
        "bd",
        "bg",
        "ct",
        "cn",
        "hk",
        "cz",
        "dk",
        "nl",
        "gb",
        "ph",
        "fi",
        "fr",
        "de",
        "gr",
        "hu",
        "id",
        "it",
        "jp",
        "kr",
        "my",
        "mn",
        "ir",
        "pl",
        "br",
        "pt",
        "ro",
        "ru",
        "rs",
        "es",
        "mx",
        "se",
        "th",
        "tr",
        "ua",
        "vn"
    ].join(",")

    domains = ["*.mangadex.org", "mangadex.org"]
    home = "https://mangadex.org/"
    chapter_url = /\/chapter\/.*/g
    api = "https://api.mangadex.org"
    pageLimit = 500 // Limit for paginated results

    getMangaInfo(json: MangaData) {
        let title = json.attributes.title.en
        if (title === undefined) {
            title = Object.entries(json.attributes.title)[0][1]
            // @TODO default is a weird description here, since we select first in object key
            console.debug("no title en, using the default language")
        }
        title = this.parseHtml("<div>" + title + "</div>").text() //html entities conversion
        return {
            title,
            url: `${this.home}title/${json.id}`
        }
    }

    async getMangaList(search) {
        const jsonSearch = await this.mirrorHelper.loadJson(`${this.api}/manga/?title=${search}`)
        return jsonSearch.data.map(mangaJson => {
            const info = this.getMangaInfo(mangaJson)
            return [info.title, info.url]
        })
    }

    async getListChaps(urlManga) {
        // let blockedGroups = amr.getOption('mangadexBlockedGroups').split(',') || []
        const id = urlManga.split("/")[4]
        const res: Record<string, InfoResult[]> = {}
        // Loop with 15 iterations at most
        for (const [page, emptyVal] of Array(20).entries()) {
            // fetch data
            const jsonChapFeed = (await this.mirrorHelper.loadJson(
                `${this.api}/manga/${id}/feed?limit=${this.pageLimit}&order[chapter]=desc&offset=${
                    page * this.pageLimit
                }&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic`
            )) as ApiListResponse<FeedData[]>
            // Create Object representing results
            const uniq = jsonChapFeed.data
                .filter(chap => chap.attributes.externalUrl == null)
                .reduce((acc, o) => {
                    if (!acc[o.attributes.chapter + mdFixLang(o.attributes.translatedLanguage)]) {
                        acc[o.attributes.chapter + mdFixLang(o.attributes.translatedLanguage)] = []
                    }
                    acc[o.attributes.chapter + mdFixLang(o.attributes.translatedLanguage)].push(o)
                    return acc
                }, {} as Record<string, FeedData[]>)

            // When chapter has multiple groups, only keep the oldest entry
            Object.values(uniq)
                .reduce((acc, list) => {
                    list.sort(
                        (a, b) =>
                            new Date(a.attributes.publishAt).getTime() - new Date(b.attributes.publishAt).getTime()
                        // && parseInt(b.attributes.chapter) - parseInt(a.attributes.chapter)
                    )
                    acc.push(list[0])
                    return acc
                }, [] as FeedData[])
                .forEach(chap => {
                    const lang = mdFixLang(chap.attributes.translatedLanguage)
                    const attributes = chap.attributes
                    if (!res[lang]) {
                        res[lang] = []
                    }
                    const titleParts = []
                    if (attributes.chapter && attributes.chapter.length > 0) {
                        titleParts.push(attributes.chapter)
                    }
                    if (attributes.title) {
                        titleParts.push(attributes.title)
                    }
                    res[lang].push([
                        titleParts.length > 0 ? titleParts.join(" - ") : "Untitled",
                        `${this.home}chapter/${chap.id}`
                    ])
                })
            // Do we need to fetch the next page ?
            const current = jsonChapFeed.limit + jsonChapFeed.offset
            const total = jsonChapFeed.total
            // no => break;
            if (current >= total) break
            // yes => wait 250ms before next iteration
            await new Promise(r => setTimeout(r, 250))
        }
        return res
    }

    async getCurrentPageInfo(doc: string, curUrl: string): Promise<CurrentPageInfo> {
        const chapterId = curUrl.split("/")[4]
        const url = `${this.api}/chapter/${chapterId}`
        const chapterJson = await this.mirrorHelper.loadJson(url)
        if (chapterJson.result !== "ok") {
            console.log(chapterJson)
            throw new Error(`Failed to get MangaDex current page info: url: "${url}"`)
        }

        const chapData = chapterJson.data
        const mangaId = chapData.relationships.filter(rel => rel.type === "manga")[0].id
        const mangaJson = await this.mirrorHelper.loadJson(`${this.api}/manga/${mangaId}`)

        const mangaInfo = this.getMangaInfo(mangaJson.data)

        return {
            name: mangaInfo.title,
            currentMangaURL: mangaInfo.url,
            currentChapterURL: curUrl.split("/").slice(0, 5).join("/"),
            language: mdFixLang(chapData.attributes.translatedLanguage)
        }
    }

    async getListImages(doc, curUrl) {
        const mangadexDataSaver = this.mirrorHelper.getOption("mangadexDataSaver")
        const chapterId = curUrl.split("/")[4]

        const serverInfo = await this.mirrorHelper.loadJson(`${this.api}/at-home/server/${chapterId}`)

        if (serverInfo.result !== "ok") {
            console.error("error during call url", curUrl)
            console.log(serverInfo)
            return []
        }

        const chapData = serverInfo.chapter

        if (mangadexDataSaver) {
            const url = `${serverInfo.baseUrl}/data-saver/${chapData.hash}`
            return chapData.dataSaver.map(id => `${url}/${id}`)
        } else {
            const url = `${serverInfo.baseUrl}/data/${chapData.hash}`
            return chapData.data.map(id => `${url}/${id}`)
        }
    }

    async getImageUrlFromPage(urlImg) {
        return urlImg
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return curUrl.split("/")[3] === "chapter"
    }
}
