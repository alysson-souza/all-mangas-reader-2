import { MirrorImplementation, MirrorObject } from "../types/common"
import { MirrorHelper } from "./MirrorHelper"
import { Manga4Life } from "./sites/Manga4Life"
import { MangaFox } from "./sites/MangaFox"
import { MangaHub } from "./sites/MangaHub"
import { MangaHere } from "./sites/MangaHere"
import { ToonilyNet } from "./sites/Madara/ToonilyNet"
import { Mangakakalot } from "./sites/MangaKakalot/Mangakakalot"
import { Manganelo } from "./sites/MangaKakalot/Manganelo"

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
            new MangaFox(mirrorHelper),
            new MangaHere(mirrorHelper),
            new Manga4Life(mirrorHelper),
            new MangaHub(mirrorHelper),
            new ToonilyNet(mirrorHelper),
            new Mangakakalot(mirrorHelper),
            new Manganelo(mirrorHelper)
        ])
    }
    return instance
}
