import { MirrorHelper } from "../../MirrorHelper"
import { Madara } from "../abstract/Madara"
import ToonilyNetIcon from "../../icons/toonily_net-optimized.png"

export class ToonilyNet extends Madara {
    mirrorName = "Toonily.Net"
    mirrorIcon = ToonilyNetIcon
    languages = "en"
    domains = ["toonily.net"]
    home = "https://toonily.net"
    chapter_url = /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
    canListFullMangas = false

    constructor(mirrorHelper: MirrorHelper) {
        super(mirrorHelper, {
            search_url: "https://toonily.net/"
        })
    }
}
