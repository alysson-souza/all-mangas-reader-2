import { Store } from "vuex"
import type { AppConfig } from "../shared/OptionStorage"

export interface RootState {
    options: AppConfig
    mangas: { all: any[] }
    mirrors: { all: Mirror[] }
}

export type AppStore = Store<RootState>

interface AbstractOptions {
    base_url?: string
    chapters_text_sel?: string
    search_url?: string
    chapters_a_sel?: string
}

export interface AppManga {
    key: string | undefined
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
}
