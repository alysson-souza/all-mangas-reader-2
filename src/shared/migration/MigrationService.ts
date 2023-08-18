import { websitesDescription } from "./OriginalMirrorLoader"
import { MirrorLoader } from "../../mirrors/MirrorLoader"

export class MigrationService {
    private readonly oldMirrors = websitesDescription

    constructor(private mirrorHelper: MirrorLoader) {}

    public getAllMirrors() {
        return this.mirrorHelper.getAll()
    }

    public stats() {
        const mirrorsToMigrate = this.oldMirrors
            .filter(m => this.mirrorHelper.hasMirror(m.mirrorName))
            .map(m => {
                return {
                    mirrorName: m.mirrorName,
                    mirrorIcon: m.mirrorIcon,
                    home: m.home,
                    abstract: m.abstract
                }
            })
        return {
            mirrorsToMigrate: mirrorsToMigrate,
            oldMirrorCount: this.oldMirrors.length,
            newMirrorCount: this.mirrorHelper.getAll().length
        }
    }
}
