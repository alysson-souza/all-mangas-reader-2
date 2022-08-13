import Icon from "../../icons/manganelo-optimized.png"
import { MirrorHelper } from "../../MirrorHelper"
import { MangakakalotAbs } from "../abstract/MangakakalotAbs"

export class Manganelo extends MangakakalotAbs {
    mirrorName = "Manganelo"
    mirrorIcon = Icon
    languages = "en"
    domains = [
        "manganato.com",
        "chap.manganato.com",
        "m.manganato.com",
        "readmanganato.com",
        "m.manganelo.com",
        "chap.manganelo.com"
    ]
    home = "https://manganato.com/"
    chapter_url = /^\/manga-.*\/chapter-\d+.*$/g

    constructor(mirrorHelper: MirrorHelper) {
        super(mirrorHelper, {
            base_url: "https://manganato.com/",
            series_list_selector: ".search-story-item a.item-title",
            chapter_list_selector: ".row-content-chapter a",
            chapter_information_selector:
                '.panel-breadcrumb:first a[href*="/manga/"]:first, .panel-breadcrumb:first a[href*="/manga-"]:first',
            images_selector: ".container-chapter-reader img"
        })
    }
}
