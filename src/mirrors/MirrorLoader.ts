import { MirrorBrowser, MirrorImplementation } from "../types/common"
import { MirrorHelper } from "../reader/MirrorHelper"
import { Manga4Life } from "./sites/Manga4Life"

export class MirrorLoader<T extends MirrorImplementation = MirrorBrowser> {
    lookupMap: Map<string, T>

    constructor(private mirrors: T[]) {
        this.lookupMap = new Map(mirrors.map(mirror => [mirror.mirrorName, mirror]))
    }

    getImpl(name: string) {
        return this.lookupMap.get(name)
    }

    getAll() {
        return Array.from(this.lookupMap)
    }
}

let instance: MirrorLoader
export const getMirrorLoader = (mirrorHelper: MirrorHelper) => {
    if (!instance) {
        instance = new MirrorLoader([new Manga4Life(mirrorHelper)])
    }
    return instance
}
