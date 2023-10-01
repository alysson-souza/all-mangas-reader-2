import { MirrorImplementation, MirrorObject } from "../types/common"
import { getDisabledImplementations } from "./sites/disabled/DisabledImplementations"

import { getMangaKakalotImplementations } from "./sites/abstract/MangakakalotAbs"
import { getMadaraImplementations } from "./sites/Madara/MadaraImplementations"
import { getMangaStreamImplementations } from "./sites/MangaStream/MangaStream"
import { getMangaStream114Implementations } from "./sites/MangaStream/MangaStream_1_1_4"
import { getFoolSlideImplementations } from "./sites/FoolSlide/FoolSlide"
import { getFunMangaImplementations } from "./sites/abstract/FunManga"
import { getMyMangaReaderCMSMirrors } from "./sites/MyMangaReaderCMS/MyMangaReaderCMS"
import { getReadMangaMirrors } from "./sites/ReadManga/ReadManga"

import { MirrorHelper } from "./MirrorHelper"
import { Manga4Life } from "./sites/Manga4Life"
import { MangaFox } from "./sites/MangaFox"
import { MangaHub } from "./sites/MangaHub"
import { MangaHere } from "./sites/MangaHere"
import { WebToon } from "./sites/WebToon"
import { ZeroScans } from "./sites/ZeroScans"
import { MangadexV5 } from "./sites/Mangadex-V5"
import { ZaHardTop } from "./sites/ZaHardTop"
import { UnionLeitor } from "./sites/UnionLeitor"
import { Tachidesk } from "./sites/Tachidesk"

export class MirrorLoader {
    lookupMap: Map<string, MirrorImplementation>

    constructor(private mirrors: MirrorImplementation[]) {
        this.lookupMap = new Map(mirrors.map(mirror => [mirror.mirrorName, mirror]))
    }

    async getImpl(name: string) {
        return this.lookupMap.get(name)
    }
    getMirror(name: string) {
        return this.toMirror(this.lookupMap.get(name))
    }

    getAll() {
        return Array.from(this.lookupMap.values()).map(m => this.toMirror(m))
    }

    hasMirror(mirrorName: string) {
        return this.lookupMap.has(mirrorName)
    }

    private toMirror(m: MirrorImplementation): MirrorObject {
        // Ensure we clone the object properties, so it will not mutate original object
        return {
            mirrorName: m.mirrorName,
            canListFullMangas: m.canListFullMangas,
            mirrorIcon: m.mirrorIcon,
            domains: [...m.domains],
            home: m.home,
            chapter_url: new RegExp(m.chapter_url),
            languages: m.languages,
            disabled: m.disabled
        }
    }
}

let instance: MirrorLoader
export const getMirrorLoader = (mirrorHelper: MirrorHelper) => {
    if (!instance) {
        instance = new MirrorLoader([
            ...getDisabledImplementations(),
            ...getFoolSlideImplementations(mirrorHelper),
            ...getFunMangaImplementations(mirrorHelper),
            ...getMadaraImplementations(mirrorHelper),
            ...getMangaStreamImplementations(mirrorHelper),
            ...getMangaStream114Implementations(mirrorHelper),
            ...getMangaKakalotImplementations(mirrorHelper),
            ...getMyMangaReaderCMSMirrors(mirrorHelper),
            ...getReadMangaMirrors(mirrorHelper),
            new MangadexV5(mirrorHelper),
            new WebToon(mirrorHelper),
            new MangaFox(mirrorHelper),
            new MangaHere(mirrorHelper),
            new Manga4Life(mirrorHelper),
            new MangaHub(mirrorHelper),
            new ZeroScans(mirrorHelper),
            new ZaHardTop(mirrorHelper),
            new UnionLeitor(mirrorHelper),
            new Tachidesk(mirrorHelper)
        ])
    }
    return instance
}
