import { MirrorHelper } from "../../MirrorHelper"
import { MirrorImplementation } from "../../../types/common"
import { Madara } from "./Madara"
import TwoFourSevenMangaIcon from "../../icons/247-manga-optimized.png"
import AquaMangaIcon from "../../icons/aqua-manga-optimized.png"
import AstralLibraryIcon from "../../icons/astrallibrary-optimized.png"
import ChibiMangaIcon from "../../icons/chibimanga-optimized.png"
import ComicDomIcon from "../../icons/comic-dom-optimized.png"
import ComickibaIcon from "../../icons/comickiba-optimized.png"
import DisasterScansIcon from "../../icons/disasterscans-optimized.png"
import DragonTeaIcon from "../../icons/dragon-tea-optimized.png"
import GDScansIcon from "../../icons/gd-scans-optimized.png"
import HiperdexIcon from "../../icons/hiperdex-optimized.png"
import HunlightScansIcon from "../../icons/hunlightscans-optimized.png"
import ImmortalupdatesIcon from "../../icons/immortalupdates-optimized.png"
import IsekaiScansIcon from "../../icons/isekaiscans-optimized.png"
import KunMangaIcon from "../../icons/kun-manga-optimized.png"
import LevelerScansIcon from "../../icons/leveler-scans-optimized.png"
import LeviatanScansIcon from "../../icons/leviatanscans-optimized.png"
import LHTranslationsIcon from "../../icons/lhtranslations-optimized.png"
import LilyMangaIcon from "../../icons/lilymanga-optimized.png"
import Manga1stOnlineIcon from "../../icons/manga1st-online-optimized.png"
import Manga1stIcon from "../../icons/manga1st-optimized.png"
import MangaBobIcon from "../../icons/mangabob-optimized.png"
import MangaDodsIcon from "../../icons/mangadods-optimized.png"
import MangaGreatIcon from "../../icons/mangagreat-optimized.png"
import MangaKomiIcon from "../../icons/mangakomi-optimized.png"
import MangaSushiIcon from "../../icons/mangasushi-optimized.png"
import MangaSyIcon from "../../icons/mangasy-optimized.png"
import MangaTXIcon from "../../icons/mangatx-optimized.png"
import ManhuaFastIcon from "../../icons/manhuafast-optimized.png"
import ManhuaPlusIcon from "../../icons/manhuaplus-optimized.png"
import ManhwaTopIcon from "../../icons/manhwa-top-optimized.png"
import ManhwaClubIcon from "../../icons/manhwaclub-optimized.png"
import ManhwaHentaiIcon from "../../icons/manhwahentai-optimized.png"
import ManytoonIcon from "../../icons/manytoon-optimized.png"
import MixedMangaIcon from "../../icons/mixed-manga-optimized.png"
import MMScansIcon from "../../icons/mmscans-optimized.png"
import NightComicIcon from "../../icons/nightcomic-optimized.png"
import RandomTranslationsIcon from "../../icons/randomtranslations-optimized.png"
import ReadManhuaIcon from "../../icons/readmanhua-optimized.png"
import ResetScansIcon from "../../icons/reset-scans-optimized.png"
import RuyaMangaIcon from "../../icons/ruya-manga-optimized.png"
import S2MangaIcon from "../../icons/s2-manga-optimized.png"
import SawamicsIcon from "../../icons/sawamics-optimized.png"
import SetsuScansIcon from "../../icons/setsuscans-optimized.png"
import SKScansIcon from "../../icons/skscans-optimized.png"
import ToonilyIcon from "../../icons/toonily-optimized.png"
import ToonilyNetIcon from "../../icons/toonilynet-optimized.png"
import TopManhuaIcon from "../../icons/topmanhua-optimized.png"
import TritiniaScansIcon from "../../icons/tritiniascans-optimized.png"
import TwilightScansIcon from "../../icons/twilightscans-optimized.png"
import UltMangaIcon from "../../icons/ultmanga-optimized.png"
import UnemployedScansIcon from "../../icons/unemployed-scans-optimized.png"
import WebtoonXyzIcon from "../../icons/webtoon-xyz-optimized.png"
import ZinMangaIcon from "../../icons/zin-manga-optimized.png"
import ThreeFourSevenMangaIcon from "../../icons/manga-347-optimized.png"
import MangaClashIcon from "../../icons/manga-clash-optimized.png"
import MangaCultivatorIcon from "../../icons/manga-cultivator-optimized.png"
import MangaLabIcon from "../../icons/manga-lab-optimized.png"
import MangaReadIcon from "../../icons/manga-read-optimized.png"
import MangazukiMeIcon from "../../icons/mangazuki-optimized.png"
import ManhuasIcon from "../../icons/manhuas-optimized.png"
import ManhuausIcon from "../../icons/manhuaus-optimized.png"

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
            mirrorName: "Webtoon.xyz",
            mirrorIcon: WebtoonXyzIcon,
            languages: "en",
            domains: ["www.webtoon.xyz"],
            home: "https://www.webtoon.xyz/",
            chapter_url: /^\/read\/.*\/.+$/g
        }),
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
        }),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "ManhwaHentai",
                mirrorIcon: ManhwaHentaiIcon,
                languages: "en",
                domains: ["manhwahentai.me"],
                home: "https://manhwahentai.me/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://manhwahentai.me/",
                img_src: "src",
                secondary_img_src: "data-src",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "247 Manga",
                mirrorIcon: TwoFourSevenMangaIcon,
                languages: "en",
                domains: ["247manga.com"],
                home: "https://247manga.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://247manga.com/"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Aqua Manga",
                mirrorIcon: AquaMangaIcon,
                languages: "en",
                domains: ["aquamanga.com"],
                home: "https://aquamanga.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://247manga.com/"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Astral Library",
                mirrorIcon: AstralLibraryIcon,
                languages: "en",
                domains: ["www.astrallibrary.net", "astrallibrary.net"],
                home: "https://www.astrallibrary.net/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: true
            },
            {
                search_url: "https://astrallibrary.net/",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "ChibiManga",
                mirrorIcon: ChibiMangaIcon,
                languages: "en",
                domains: ["www.cmreader.info"],
                home: "https://www.cmreader.info/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://www.cmreader.info/",
                search_json: false,
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Comic Kiba",
                mirrorIcon: ComickibaIcon,
                languages: "en",
                domains: ["www.comickiba.com"],
                home: "https://www.comickiba.com/",
                canListFullMangas: true,
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://www.comickiba.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Disaster Scans",
                mirrorIcon: DisasterScansIcon,
                languages: "en",
                domains: ["www.disasterscans.com"],
                home: "https://www.disasterscans.com/",
                canListFullMangas: false,
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://www.disasterscans.com/",
                img_src: "data-src",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Dragon Tea",
                mirrorIcon: DragonTeaIcon,
                languages: "en",
                domains: ["dragontea.ink"],
                home: "https://dragontea.ink/",
                canListFullMangas: false,
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://www.dragontea.ink/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "GD Scans",
                mirrorIcon: GDScansIcon,
                languages: "en",
                domains: ["gdstmp.site", "gdscans.com"],
                home: "https://www.gdscans.com/",
                canListFullMangas: false,
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://www.gdscans.com/",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Hiperdex",
                mirrorIcon: HiperdexIcon,
                languages: "en",
                domains: ["www.hiperdex.com"],
                home: "https://www.hiperdex.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://www.hiperdex.com/",
                search_json: true,
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Hunlight Scans",
                mirrorIcon: HunlightScansIcon,
                languages: "en",
                domains: ["www.disasterscans.com"],
                home: "https://www.disasterscans.com/",
                canListFullMangas: false,
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://www.disasterscans.com/",
                img_src: "data-src",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Immortal Updates",
                mirrorIcon: ImmortalupdatesIcon,
                languages: "en",
                domains: ["immortalupdates.com"],
                home: "https://immortalupdates.com/",
                canListFullMangas: false,
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://immortalupdates.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "IsekaiScans",
                mirrorIcon: IsekaiScansIcon,
                languages: "en",
                domains: ["isekaiscan.com"],
                home: "https://isekaiscan.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://isekaiscan.com/",
                img_src: "data-src",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Kun Manga",
                mirrorIcon: KunMangaIcon,
                languages: "en",
                domains: ["kunmanga.com"],
                home: "https://kunmanga.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://kunmanga.com/"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Leveler Scans",
                mirrorIcon: LevelerScansIcon,
                languages: "en",
                domains: ["levelerscans.xyz"],
                home: "https://levelerscans.xyz/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://levelerscans.xyz/",
                chapter_list_ajax: true,
                img_src: "data-src"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Leviatan Scans",
                mirrorIcon: LeviatanScansIcon,
                languages: "en",
                domains: ["leviatanscans.com", "en.leviatanscans.com"],
                home: "https://en.leviatanscans.com/",
                chapter_url: /\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: true
            },
            {
                search_url: "https://en.leviatanscans.com/",
                chapter_list_ajax: true,
                path_length: 2,
                sort_chapters: true,
                isekai_chapter_url: true,
                title_selector: "div.post-title > h1",
                image_protection_plugin: true,
                urlProcessor: url => {
                    let t = url.split("/")
                    if (t[3] != "manga") t.splice(3, 1)
                    return t.join("/")
                }
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Leviatan Scans Spanish",
                mirrorIcon: LeviatanScansIcon,
                languages: "es",
                domains: ["leviatanscans.com", "es.leviatanscans.com"],
                home: "https://es.leviatanscans.com/",
                chapter_url: /\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: true
            },
            {
                search_url: "https://es.leviatanscans.com/",
                chapter_list_ajax: true,
                path_length: 2,
                sort_chapters: true,
                isekai_chapter_url: true,
                title_selector: "#manga-title > h1",
                urlProcessor: url => {
                    let t = url.split("/")
                    if (t[3] != "manga") t.splice(3, 1)
                    return t.join("/")
                }
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "LHTranslations",
                mirrorIcon: LHTranslationsIcon,
                languages: "en",
                domains: ["lhtranslation.net"],
                home: "https://lhtranslation.net",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: true
            },
            {
                search_url: "https://lhtranslation.net/",
                chapter_list_ajax: true,
                isekai_chapter_url: true,
                chapters_a_sel: `li.wp-manga-chapter > a[href*="lhtranslation.net"]`
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Lily Manga",
                mirrorIcon: LilyMangaIcon,
                languages: "en",
                domains: ["lilymanga.com"],
                home: "https://lilymanga.com/",
                chapter_url: /^\/ys\/.*\/.+$/g,
                canListFullMangas: true
            },
            {
                search_url: "https://lilymanga.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga 1st",
                mirrorIcon: Manga1stIcon,
                languages: "en",
                domains: ["manga1st.com"],
                home: "https://manga1st.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manga1st.com/",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga 347",
                mirrorIcon: ThreeFourSevenMangaIcon,
                languages: "en",
                domains: ["manga347.com"],
                home: "https://manga347.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manga347.com/",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Bob",
                mirrorIcon: MangaBobIcon,
                languages: "en",
                domains: ["mangabob.com"],
                home: "https://mangabob.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: true
            },
            {
                search_url: "https://mangabob.com/",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Clash",
                mirrorIcon: MangaClashIcon,
                languages: "en",
                domains: ["mangaclash.com"],
                home: "https://mangaclash.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|devmax)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://mangaclash.com/"
                // chapters_a_sel: "li.wp-manga-chapter .li__text a",
                // chapter_list_ajax: true,
                // isekai_chapter_url: true,
                // image_protection_plugin: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Cultivator",
                mirrorIcon: MangaCultivatorIcon,
                languages: "en",
                domains: ["mangacultivator.com"],
                home: "https://mangacultivator.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: true
            },
            {
                search_url: "https://mangacultivator.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Dods",
                mirrorIcon: MangaDodsIcon,
                languages: "en",
                domains: ["www.mangadods.com"],
                home: "https://www.mangadods.com/",
                chapter_url: /\/manga\/.*\/(ch-)?\d/g,
                canListFullMangas: false
            },
            {
                search_url: "https://www.mangadods.com/",
                img_src: "src",
                chapter_list_ajax: false,
                secondary_img_src: "data-src",
                chapters_a_sel: "li.wp-manga-chapter a"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Great",
                mirrorIcon: MangaGreatIcon,
                languages: "en",
                domains: ["mangagreat.com"],
                home: "https://mangagreat.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://mangagreat.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Komi",
                mirrorIcon: MangaKomiIcon,
                languages: "en",
                domains: ["mangakomi.com", "mangakomi.io"],
                home: "https://mangakomi.io/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://mangakomi.io/",
                img_src: "src",
                secondary_img_src: "data-src",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Lab",
                mirrorIcon: MangaLabIcon,
                languages: "en",
                domains: ["themangalab.com"],
                home: "https://themangalab.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://themangalab.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Read",
                mirrorIcon: MangaReadIcon,
                languages: "en",
                domains: ["www.mangaread.org"],
                home: "https://www.mangaread.org/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://www.mangaread.org/"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Sushi",
                mirrorIcon: MangaSushiIcon,
                languages: "en",
                domains: ["mangasushi.net", "mangasushi.org"],
                home: "https://mangasushi.org/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://mangasushi.org/",
                secondary_img_src: "data-src",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga Sy",
                mirrorIcon: MangaSyIcon,
                languages: "en",
                domains: ["www.mangasy.com"],
                home: "https://www.mangasy.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://www.mangasy.com/",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga TX",
                mirrorIcon: MangaTXIcon,
                languages: "en",
                domains: ["mangatx.com"],
                home: "https://mangatx.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://mangatx.com/",
                img_src: "data-src",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "MangazukiMe",
                mirrorIcon: MangazukiMeIcon,
                languages: "en",
                domains: ["mangazuki.me"],
                home: "https://mangazuki.me",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://mangazuki.me/",
                page_container_sel: "div.read-container",
                img_sel: "div.read-container img"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "ManhuaFast",
                mirrorIcon: ManhuaFastIcon,
                languages: "en",
                domains: ["manhuafast.com"],
                home: "https://manhuafast.com/",
                chapter_url: /\/manga\/.+\/chapter-.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manhuafast.com/",
                img_src: "src",
                chapter_list_ajax: true,
                isekai_chapter_url: true
                // secondary_img_src: "data-full-url"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "ManhuaPlus",
                mirrorIcon: ManhuaPlusIcon,
                languages: "en",
                domains: ["manhuaplus.com"],
                home: "https://manhuaplus.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manhuaplus.com/",
                search_a_sel: "div.post-title > h3 > a",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manhuas",
                mirrorIcon: ManhuasIcon,
                languages: "en",
                domains: ["manhuas.net"],
                home: "https://manhuas.net/",
                chapter_url: /\/manhua\/.*\-chapter\-.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manhuas.net/",
                img_src: "data-src",
                // chapter_list_ajax: true,
                secondary_img_src: "src"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manhuaus",
                mirrorIcon: ManhuausIcon,
                languages: "en",
                domains: ["manhuaus.com"],
                home: "https://manhuaus.com/",
                chapter_url: /\/manga\/.+\/chapter\-.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manhuaus.com/",
                img_src: "src",
                chapter_list_ajax: true,
                isekai_chapter_url: true,
                secondary_img_src: "data-src"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "ManhwaClub",
                mirrorIcon: ManhwaClubIcon,
                languages: "en",
                domains: ["manhwa.club"],
                home: "https://manhwa.club/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manhwa.club/",
                secondary_img_src: "data-src"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manhwa Top",
                mirrorIcon: ManhwaTopIcon,
                languages: "en",
                domains: ["manhwatop.com"],
                home: "https://manhwatop.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manhwatop.com/",
                chapter_list_ajax: true,
                img_src: "data-src"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manytoon",
                mirrorIcon: ManytoonIcon,
                languages: "en",
                domains: ["manytoon.com"],
                home: "https://manytoon.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manytoon.com/",
                img_src: "data-src",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Mixed Manga",
                mirrorIcon: MixedMangaIcon,
                languages: "en",
                domains: ["mixedmanga.com"],
                home: "https://mixedmanga.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://mixedmanga.com/",
                img_src: "data-lazy-src"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "MM Scans",
                mirrorIcon: MMScansIcon,
                languages: "en",
                domains: ["mm-scans.com", "mm-scans.org"],
                home: "https://mm-scans.org/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://mm-scans.org/",
                chapter_list_ajax: true,
                isekai_chapter_url: true,
                chapters_a_sel: "li.chapter-li > a"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Night Comic",
                mirrorIcon: NightComicIcon,
                languages: "en",
                domains: ["www.nightcomic.com"],
                home: "https://www.nightcomic.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://www.nightcomic.com/",
                img_src: "data-src",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Random Translations",
                mirrorIcon: RandomTranslationsIcon,
                languages: "en",
                domains: ["randomtranslations.com"],
                home: "https://randomtranslations.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://randomtranslations.com/",
                img_src: "data-src",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Read Manhua",
                mirrorIcon: ReadManhuaIcon,
                languages: "en",
                domains: ["readmanhua.net"],
                home: "https://readmanhua.net/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: true
            },
            {
                search_url: "https://readmanhua.net/",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Reset Scans",
                mirrorIcon: ResetScansIcon,
                languages: "en",
                domains: ["reset-scans.com"],
                home: "https://reset-scans.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|devmax)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://reset-scans.com/",
                chapters_a_sel: "li.wp-manga-chapter .li__text a",
                chapter_list_ajax: true,
                isekai_chapter_url: true
                // image_protection_plugin: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Ruya Manga",
                mirrorIcon: RuyaMangaIcon,
                languages: "en",
                domains: ["en.ruyamanga.com"],
                home: "https://en.ruyamanga.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://en.ruyamanga.com/"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "S2 Manga",
                mirrorIcon: S2MangaIcon,
                languages: "en",
                domains: ["s2manga.com"],
                home: "https://s2manga.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://s2manga.com/"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Sawamics",
                mirrorIcon: SawamicsIcon,
                languages: "en",
                domains: ["sawamics.com"],
                home: "https://sawamics.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://sawamics.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Setsu Scans",
                mirrorIcon: SetsuScansIcon,
                languages: "en",
                domains: ["setsuscans.com"],
                home: "https://setsuscans.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://setsuscans.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true,
                chapter_list_ajax_selctor_type: "html",
                chapter_list_ajax_selctor: "#manga-chapters-holder"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "SK Scans",
                mirrorIcon: SKScansIcon,
                languages: "en",
                domains: ["skscans.com"],
                home: "https://skscans.com/home",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://skscans.com/",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Top Manhua",
                mirrorIcon: TopManhuaIcon,
                languages: "en",
                domains: ["www.topmanhua.com"],
                home: "https://www.topmanhua.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://www.topmanhua.com/"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Tritinia Scans",
                mirrorIcon: TritiniaScansIcon,
                languages: "en",
                domains: ["tritinia.com", "tritinia.org"],
                home: "https://tritinia.org/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://tritinia.org/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Twilight Scans",
                mirrorIcon: TwilightScansIcon,
                languages: "en",
                domains: ["twilightscans.com"],
                home: "https://twilightscans.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://twilightscans.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true,
                secondary_img_src: "data-src"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Ult Manga",
                mirrorIcon: UltMangaIcon,
                languages: "en",
                domains: ["ultmanga.com"],
                home: "https://ultmanga.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://ultmanga.com/",
                img_src: "data-src"
                // chapter_list_ajax: true,
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Unemployed Scans",
                mirrorIcon: UnemployedScansIcon,
                languages: "en",
                domains: ["unemployedscans.com"],
                home: "https://unemployedscans.com/",
                canListFullMangas: false,
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g
            },
            {
                search_url: "https://unemployedscans.com/",
                chapter_list_ajax: true
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Zin Manga",
                mirrorIcon: ZinMangaIcon,
                languages: "en",
                domains: ["zinmanga.com"],
                home: "https://zinmanga.com/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://zinmanga.com/"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Comic Dom",
                mirrorIcon: ComicDomIcon,
                languages: "en",
                domains: ["comicdom.org"],
                home: "https://comicdom.org/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://zinmanga.com/"
            }
        ),
        new Madara(
            mirrorHelper,
            {
                mirrorName: "Manga 1st Online",
                mirrorIcon: Manga1stOnlineIcon,
                languages: "en",
                domains: ["manga1st.online"],
                home: "https://manga1st.online/",
                chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
                canListFullMangas: false
            },
            {
                search_url: "https://manga1st.online/"
            }
        )
    ]
}
