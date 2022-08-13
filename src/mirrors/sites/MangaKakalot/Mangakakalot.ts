import Icon from "../../icons/mangakakalot-optimized.png"
import { MirrorHelper } from "../../MirrorHelper"
import { MangakakalotAbs } from "../abstract/MangakakalotAbs"

export class Mangakakalot extends MangakakalotAbs {
    mirrorName = "Mangakakalot"
    mirrorIcon = Icon
    languages = "en"
    domains = ["mangakakalot.com"]
    home = "https://mangakakalot.com/"
    chapter_url = /^\/chapter\/.*\/.+$/g

    constructor(mirrorHelper: MirrorHelper) {
        super(mirrorHelper, { base_url: "https://mangakakalot.com/" })
    }
}
