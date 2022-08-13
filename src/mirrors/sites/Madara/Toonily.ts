import { MirrorHelper } from "../../MirrorHelper"
import { Madara } from "../abstract/Madara"
import Icon from "../../icons/toonily-optimized.png"

export class Toonily extends Madara {
    mirrorName = "Toonily"
    mirrorIcon = Icon
    languages = "en"
    domains = ["toonily.com"]
    home = "https://toonily.com/"
    chapter_url = /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
    canListFullMangas = false

    constructor(mirrorHelper: MirrorHelper) {
        super(mirrorHelper, { search_url: "https://toonily.com/" })
    }
}
