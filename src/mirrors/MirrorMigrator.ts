import { MirrorImplementation } from "../types/common"

/**
 * Allow to migrate specific mirror options
 *
 *
 * "u": "https://asura.gg/manga/the-s-classes-that-i-raised/",
 * "l": "https://www.asurascans.com/the-s-classes-that-i-raised-chapter-83/",
 *
 * "u": "https://www.asurascans.com/manga/8239705535-the-s-classes-that-i-raised/",
 * "l": "https://www.asurascans.com/the-s-classes-that-i-raised-chapter-86/",
 *
 * "u": "https://www.asurascans.com/manga/0223090894-the-s-classes-that-i-raised/",
 * "l": "https://www.asurascans.com/2226495089-the-s-classes-that-i-raised-chapter-94/",
 */
export class MirrorMigrator {
    public findAlternative(mirror: MirrorImplementation) {
        return
    }
}

let instance: MirrorMigrator
export const getMirrorMigrator = () => {
    if (!instance) {
        instance = new MirrorMigrator()
    }
    return instance
}
