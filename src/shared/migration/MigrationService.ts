import { websitesDescription } from "./OriginalMirrorLoader"
import { MirrorLoader } from "../../mirrors/MirrorLoader"

export class MigrationService {
    private readonly oldMirrors = websitesDescription

    constructor(private mirrorLoader: MirrorLoader) {}

    public getAllMirrors() {
        return this.mirrorLoader.getAll()
    }

    public stats() {
        const mirrorsToMigrate = this.oldMirrors
            .filter(m => !this.mirrorLoader.hasMirror(m.mirrorName) && m.type !== "abstract")
            .map(m => {
                return {
                    mirrorName: m.mirrorName,
                    mirrorIcon: m.mirrorIcon,
                    home: m.home,
                    abstract: m.abstract,
                    disabled: m.disabled
                }
            })
        const all = this.mirrorLoader.getAll()
        return {
            mirrorsToMigrate: mirrorsToMigrate,
            oldMirrorCount: this.oldMirrors.length,
            newMirrorCount: all.length,
            disabledMirrorCount: all.filter(m => m.disabled).length
        }
    }
}
