import { CurrentPageInfo, InfoResult, MirrorImplementation, MirrorObject } from "../../../types/common"

interface DisableMirrorSetup extends MirrorObject {
    abstract?: string
    abstract_options?: unknown
    api?: string
}

export class DisabledMirror implements MirrorImplementation {
    chapter_url: RegExp
    domains: string[]
    home: string
    languages: string
    mirrorIcon: string
    mirrorName: string
    disabled: boolean

    constructor(mirror: DisableMirrorSetup) {
        this.mirrorName = mirror.mirrorName
        this.mirrorIcon = mirror.mirrorIcon
        this.domains = mirror.domains
        this.home = mirror.home
        this.chapter_url = mirror.chapter_url
        this.languages = mirror.languages
        this.disabled = true
    }

    async getCurrentPageInfo(doc: string, curUrl: string): Promise<CurrentPageInfo> {
        throw new Error(`Calling disabled mirror ${this.mirrorName} method`)
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        throw new Error(`Calling disabled mirror ${this.mirrorName} method`)
    }

    async getListChaps(urlManga: string): Promise<InfoResult[] | Record<string, InfoResult[]>> {
        throw new Error(`Calling disabled mirror ${this.mirrorName} method`)
    }

    getListImages(doc: string, curUrl: string, sender): Promise<string[]> {
        throw new Error(`Calling disabled mirror ${this.mirrorName} method`)
    }

    getMangaList(search?: string): Promise<InfoResult[]> {
        throw new Error(`Calling disabled mirror ${this.mirrorName} method`)
    }

    isCurrentPageAChapterPage(doc: string, curUrl: string): boolean {
        throw new Error(`Calling disabled mirror ${this.mirrorName} method`)
    }
}
