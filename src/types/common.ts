import { Store } from "vuex"
import type { AppOptions } from "../shared/OptionStorage"

export interface RootState {
    options: AppOptions
    mangas: { all: any[] }
    mirrors: { all: Mirror[] }
    bookmarks: { all: Bookmark[] }
}

interface Bookmark {
    key: string
    url: string
    chapUtrl: string
    type: string
    name: string
    chapName: string
    scanUrl: string
    scanName: string
    note: string
}

export type AppStore = Store<RootState>

interface AbstractOptions {
    base_url?: string
    chapters_text_sel?: string
    search_url?: string
    chapters_a_sel?: string
}

export interface Category {
    name: string
    state: "include" | "exclude"
    type: "native" | "language"
}

export interface AppManga {
    key: string | undefined

    /** Mirror name **/
    mirror: string

    name: string
    url: string

    lastChapterReadURL: string
    lastChapterReadName: string
    listChaps: string[]
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
}

export interface Mirror {
    activated?: boolean
    mirrorName: string
    canListFullMangas: boolean
    mirrorIcon: string
    domains: string[]
    home: string
    chapter_url: RegExp
    languages: string
    abstract: string
    abstract_options: AbstractOptions
    disabled?: boolean
}
