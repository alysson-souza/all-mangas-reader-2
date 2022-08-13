import { MirrorHelper } from "../../MirrorHelper"
import { MirrorImplementation } from "../../../types/common"
import { Madara } from "./Madara"
import ToonilyIcon from "../../icons/toonily-optimized.png"
import ToonilyNetIcon from "../../icons/toonily_net-optimized.png"
import MangaKomiIcon from "../../icons/mangakomi-optimized.png"

/**
 * All implementations based of Madara are placed here
 * avoids the need to create new file for each implementation
 *
 * @NOTE: home or search_url option must end in "/"
 */
export const getMadaraImplementations = (mirrorHelper: MirrorHelper): MirrorImplementation[] => {
    return [
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Komi",
                mirrorIcon: MangaKomiIcon,
                languages: "en",
                domains: ["mangakomi.io", "mangakomi.com"],
                home: "https://mangakomi.io/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://mangakomi.io/",
                img_src: "src",
                secondary_img_src: "data-src",
                chapter_list_ajax: true
            }
        ),
        new Madara(mirrorHelper, {
            mirrorName: "Toonily",
            mirrorIcon: ToonilyIcon,
            languages: "en",
            domains: ["toonily.com"],
            home: "https://toonily.com/",
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
        }),
        new Madara(mirrorHelper, {
            mirrorName: "Toonily.Net",
            mirrorIcon: ToonilyNetIcon,
            languages: "en",
            domains: ["toonily.net"],
            home: "https://toonily.net/",
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
        })
    ]
}
