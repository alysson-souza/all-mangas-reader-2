import { Mirror, MirrorImplementation } from "../types/common"
import { MirrorHelper } from "../reader/MirrorHelper"
import { Manga4Life } from "./sites/Manga4Life"

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