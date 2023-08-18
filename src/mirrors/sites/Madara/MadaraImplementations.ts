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
import ImmortalupdatesIcon from "../../icons/immortalupdates-optimized.png";
import ImperfectComicsIcon from "../../icons/imperfect-comics-optimized.png";
import IsekaiScansIcon from "../../icons/isekaiscans-optimized.png";
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
import MangaReaderIcon from "../../icons/mangareader-optimized.png"
import MangaSushiIcon from "../../icons/mangasushi-optimized.png"
import MangaSyIcon from "../../icons/mangasy-optimized.png"
import MangaTXIcon from "../../icons/mangatx-optimized.png"
import MangaZukiIcon from "../../icons/mangazuki-optimized.png"
import MangaZukiMeIcon from "../../icons/mangazukime-optimized.png"
import ManhuaFastIcon from "../../icons/manhuafast-optimized.png"
import ManhuaPlusIcon from "../../icons/manhuaplus-optimized.png"
import ManhuaSIcon from "../../icons/manhuas-optimized.png"
import ManhuaUSIcon from "../../icons/manhuaus-optimized.png"
import ManhwaTopIcon from "../../icons/manhwa-top-optimized.png"
import ManhwaClubIcon from "../../icons/manhwaclub-optimized.png"
import ManhwaHentaiIcon from "../../icons/manhwahentai-optimized.png"
import ManytoonIcon from "../../icons/manytoon-optimized.png"
import MixedMangaIcon from "../../icons/mixed-manga-optimized.png"
import MMScansIcon from "../../icons/mmscans-optimized.png"
import NightComicIcon from "../../icons/nightcomic-optimized.png"
import RandomTranslationsIcon from "../../icons/randomtranslations-optimized.png"
import ReadManhuaIcon from "../../icons/readmanhua-optimized.png";
import ResetScansIcon from "../../icons/reset-scans-optimized.png";
import RuyaMangaIcon from "../../icons/ruya-manga-optimized.png";
import S2MangaIcon from "../../icons/s2-manga-optimized.png";
import SawamicsIcon from "../../icons/sawamics-optimized.png";
import SetsuScansIcon from "../../icons/setsuscans-optimized.png";
import ShoujoHeartsIcon from "../../icons/shoujohearts-optimized.png";
import SKScansIcon from "../../icons/skscans-optimized.png";
import ToonilyIcon from "../../icons/toonily-optimized.png";
import ToonilyNetIcon from "../../icons/toonilynet-optimized.png";
import ToonilyNetIcon2 from "../../icons/toonily_net-optimized.png";
import TopManhuaIcon from "../../icons/topmanhua-optimized.png";
import TritiniaScansIcon from "../../icons/tritiniascans-optimized.png";
import TwilightScansIcon from "../../icons/twilightscans-optimized.png";
import UltMangaIcon from "../../icons/ultmanga-optimized.png";
import UnemployedScansIcon from "../../icons/unemployed-scans-optimized.png";
import WebtoonXyzIcon from "../../icons/webtoon-xyz-optimized.png"
import ZinMangaIcon from "../../icons/zin-manga-optimized.png"

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
		new Madara(mirrorHelper, {
            mirrorName: "Manhwahentai.me",
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
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "247 Manga",
            mirrorIcon: TwoFourSevenMangaIcon,
            languages: "en",
            domains: ["247manga.com"],
            home: "https://247manga.com/",
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        },
		{
		        search_url: "https://247manga.com/"
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "Aqua Manga",
            mirrorIcon: AquaMangaIcon,
            languages: "en",
            domains: ["aquamanga.com"],
            home: "https://aquamanga.com/",
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series|read)\/.*\/.+$/g,
            canListFullMangas: false,
        },
		{
		        search_url: "https://247manga.com/"
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "Astral Library",
            mirrorIcon: AstralLibraryIcon,
            languages: "en",
            domains: ["www.astrallibrary.net", "astrallibrary.net"],
            home: "https://www.astrallibrary.net/",
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
            canListFullMangas: true,
        },
		{
                search_url: "https://astrallibrary.net/",
                chapter_list_ajax: true
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "ChibiManga",
            mirrorIcon: ChibiMangaIcon,
            languages: "en",
            domains: ["www.cmreader.info"],
            home: "https://www.cmreader.info/",
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        },
		{
                search_url: "https://www.cmreader.info/",
                search_json: false,
                chapter_list_ajax: true
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "Comic Kiba",
            mirrorIcon: ComickibaIcon,
            languages: "en",
            domains: ["www.comickiba.com"],
            home: "https://www.comickiba.com/",
            canListFullMangas: true,
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        },
		{
                search_url: "https://www.comickiba.com/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "Disaster Scans",
            mirrorIcon: DisasterScansIcon,
            languages: "en",
            domains: ["www.disasterscans.com"],
            home: "https://www.disasterscans.com/",
            canListFullMangas: false,
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        },
		{
                search_url: "https://www.disasterscans.com/",
                img_src: "data-src",
                chapter_list_ajax: true,
                isekai_chapter_url: true
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "Dragon Tea",
            mirrorIcon: DragonTeaIcon,
            languages: "en",
            domains: ["dragontea.ink"],
            home: "https://dragontea.ink/",
            canListFullMangas: false,
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        },
		{
                search_url: "https://www.dragontea.ink/",
                chapter_list_ajax: true,
                isekai_chapter_url: true
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "GD Scans",
            mirrorIcon: GDScansIcon,
            languages: "en",
            domains: ["gdstmp.site", "gdscans.com"],
            home: "https://www.gdscans.com/",
            canListFullMangas: false,
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        },
		{
                search_url: "https://www.gdscans.com/",
                chapter_list_ajax: true,
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "Hiperdex",
            mirrorIcon: HiperdexIcon,
            languages: "en",
            domains: ["www.hiperdex.com"],
            home: "https://www.hiperdex.com/",
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        },
		{
                search_url: "https://www.hiperdex.com/",
                search_json: true,
                chapter_list_ajax: true,
                isekai_chapter_url: true
				
		}),
        new Madara(mirrorHelper, {
            mirrorName: "Hunlight Scans",
            mirrorIcon: HunlightScansIcon,
            languages: "en",
            domains: ["www.disasterscans.com"],
            home: "https://www.disasterscans.com/",
            canListFullMangas: false,
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
        },
		{
                search_url: "https://www.disasterscans.com/",
                img_src: "data-src",
                chapter_list_ajax: true,
                isekai_chapter_url: true
				
		}),
    ]
}
