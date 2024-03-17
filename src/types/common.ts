import { Store } from "vuex"
import type { AppOptions } from "../shared/OptionStorage"
import { Notifications } from "webextension-polyfill"

export interface RootState {
    options: AppOptions
    mangas: { all: AppManga[] }
    mirrors: { all: Mirror[] }
    bookmarks: { all: Bookmark[] }
}

export interface Bookmark {
    key: string
    url: string
    chapUrl: string
    mirror: string
    type: string
    name: string
    chapName: string
    scanUrl: string
    scanName: string
    note: string
}

export type AppStore = Store<RootState>
export type AppState = Pick<AppStore, "state">

export interface Category {
    name: string
    state: "include" | "exclude"
    type: "native" | "language"
}

export type ListChapter = [name: string, url: string]

export interface AppManga {
    key: string | undefined

    /** Mirror name **/
    mirror: string

    name: string
    url: string

    lastChapterReadURL: string
    lastChapterReadName: string

    /**
     * DESC sorted list of chapter name and full url
     * ['Chapter 59', 'https://mangasite.com/manga/1333/chapter-59'],
     * ['Chapter 58', 'https://mangasite.com/manga/1333/chapter-58'],
     * ....
     */
    listChaps: ListChapter[]

    // start(0) / stop(1) following updates (unread chapters in manga list)
    read: 0 | 1

    // start(1) / stop(0) updating (looking for new chapters) mangas
    update: 0 | 1

    display: 0 | 1

    layout: 0 | 1

    cats: string[]

    // Update the last read chapter of a manga
    ts: number

    // Update the last options
    tsOpts: number

    // last time we found a new chapter
    upts: number

    webtoon: boolean

    scaleUp: 0 | 1

    displayName: string

    language: string
    languages: string[]

    currentChapter: string
    currentScanUrl: string

    zoom?: number
}

/** Plain javascript object with static properties defined **/
export interface MirrorObject {
    mirrorName: string
    canListFullMangas?: boolean
    mirrorIcon: string
    domains: string[]
    home: string
    chapter_url: RegExp
    languages: string
    disabled?: boolean
}

/** Mirror really represent vuex object that have additional activated property **/
export interface Mirror extends MirrorObject {
    activated?: boolean
}

export interface CurrentPageInfo {
    name: string
    currentMangaURL: string
    currentChapterURL: string
    /** Seems like only used by MangaDex to populate list of languages 'en,de,...' **/
    language?: string
}

export interface ChapterData {
    isChapter?: boolean
    infos?: CurrentPageInfo
    images: string[] | null
    title?: string
}

export type InfoResult = [name: string, url: string]

export interface Sender {
    tab: { id: number }
}

export interface ScriptJsonInject {
    target: { tabId: number }
    url: string
    config?: RequestInit
}

export interface MirrorImplementation extends MirrorObject {
    getMangaList(search?: string): Promise<InfoResult[]>

    getListChaps(urlManga: string): Promise<InfoResult[] | Record<string, InfoResult[]>>

    getCurrentPageInfo(doc: string, curUrl: string): Promise<CurrentPageInfo>

    getListImages(doc: string, curUrl: string, sender: Sender): Promise<string[]>

    getImageUrlFromPage(urlImage: string): Promise<string>

    isCurrentPageAChapterPage(doc: string, curUrl: string): boolean

    getChapterTitle?: (doc: string, curUrl: string) => Promise<string>
}

/// SYNC related types
interface BaseLastSync {
    provider: "gist"
    /** ISO 8601 date string **/
    date: string
    status: "success" | "error"
}

export interface LastSyncSuccess extends BaseLastSync {
    status: "success"
}

export interface LastSyncError extends BaseLastSync {
    status: "error"
    errorDetails: {
        type: "rate-limit" | "api" | "unknown"
        message: string
        context?: Record<string, unknown>
    }
}

export type LastSync = LastSyncSuccess | LastSyncError

export type NotificationCreate = Pick<
    Notifications.CreateNotificationOptions,
    "title" | "message" | "contextMessage" | "isClickable"
>
