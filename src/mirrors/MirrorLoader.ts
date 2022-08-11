import { Mirror, MirrorImplementation } from "../types/common"
import { MirrorHelper } from "./MirrorHelper"
import { Manga4Life } from "./sites/Manga4Life"
import { MangaFox } from "./sites/MangaFox"
import { MangaHub } from "./sites/MangaHub"
import { MangaHere } from "./sites/MangaHere"

export class MirrorLoader {
    lookupMap: Map<string, MirrorImplementation>

    constructor(private mirrors: MirrorImplementation[]) {
        this.lookupMap = new Map(mirrors.map(mirror => [mirror.mirrorName, mirror]))
    }

    async getImpl(name: string) {
        return this.lookupMap.get(name)
    }
    getMirror(name: string): Readonly<Mirror> {
        return this.lookupMap.get(name)
    }

    getAll(): Readonly<Mirror[]> {
        return Array.from(this.lookupMap.values()).map(m => this.toMirror(m))
    }

    private toMirror(m: MirrorImplementation): Required<Mirror> {
        return {
            activated: m.activated,
            mirrorName: m.mirrorName,
            canListFullMangas: m.canListFullMangas,
            mirrorIcon: m.mirrorIcon,
            domains: m.domains,
            home: m.home,
            chapter_url: m.chapter_url,
            languages: m.languages,
            abstract: m.abstract,
            abstract_options: m.abstract_options,
            disabled: m.disabled
        }
    }
}

let instance: MirrorLoader
export const getMirrorLoader = (mirrorHelper: MirrorHelper) => {
    if (!instance) {
        instance = new MirrorLoader([
            new MangaFox(mirrorHelper),
            new MangaHere(mirrorHelper),
            new Manga4Life(mirrorHelper),
            new MangaHub(mirrorHelper)
        ])
    }
    return instance
}
