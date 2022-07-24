import { Store } from "vuex"
import type { AppConfig } from "../shared/OptionStorage"

export type AppStore = Store<{
    options: AppConfig
    mangas: { all: any[] }
}>

interface AbstractOptions {
    base_url?: string
    chapters_text_sel?: string
    search_url?: string
    chapters_a_sel?: string
}

export interface Mirror {
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
