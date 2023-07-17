import { DisabledMirror } from "./DisabledMirror"
import NonStopScansIcon from "../../icons/nonstopscans-optimized.png"

export const getDisabledImplementations = () => {
    return [
        new DisabledMirror({
            disabled: true,
            mirrorName: "Aloalivn",
            mirrorIcon: require("../../icons/aloalivn-optimized.png"),
            languages: "en",
            domains: ["aloalivn.com"],
            home: "https://aloalivn.com/",
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
            canListFullMangas: false,
            abstract: "Madara",
            abstract_options: {
                search_url: "https://aloalivn.com/",
                chapter_list_ajax: true
            }
        }),
        new DisabledMirror({
            mirrorName: "Arang Scans",
            mirrorIcon: require("../../icons/arangscans-optimized.png"),
            languages: "en",
            domains: ["arangscans.org"],
            home: "https://arangscans.org/",
            canListFullMangas: true,
            disabled: true,
            chapter_url: /^\/chapters\/.*\/.+$/g
        }),
        new DisabledMirror({
            mirrorName: "Bacamanga",
            canListFullMangas: false,
            disabled: true,
            mirrorIcon: require("../../icons/bacamanga-optimized.png"),
            domains: ["bacamanga.co"],
            home: "https://bacamanga.co/",
            chapter_url: /^\/m[0-9]+\/$/g,
            languages: "id",
            abstract: "MangastreamAbs",
            abstract_options: {
                search_url: "https://bacamanga.co/",
                chapters_a_sel: "div.bixbox.bxcl > ul > li > span.lchx a"
            }
        }),
        new DisabledMirror({
            mirrorName: "Bang Aqua",
            mirrorIcon: require("../../icons/bangaqua-optimized.png"),
            languages: "en",
            disabled: true,
            domains: ["reader.bangaqua.com"],
            home: "http://bangaqua.com/",
            chapter_url: /^\/read\/.+$/g,

            abstract: "FoolSlide",
            abstract_options: {
                base_url: "http://reader.bangaqua.com",
                mglist_selector: ".title > a[href*='/series/']"
            }
        }),
        new DisabledMirror({
            disabled: true,
            mirrorName: "CatManga",
            mirrorIcon: require("../../icons/catmanga-optimized.png"),
            languages: "en",
            domains: ["catmanga.org"],
            home: "https://catmanga.org",
            chapter_url: /^\/series\/.*?\/\d+$/g,
            abstract: "NextJs",
            canListFullMangas: true
        }),
        new DisabledMirror({
            mirrorName: "Doki Reader",
            mirrorIcon: require("../../icons/doki-optimized.png"),
            languages: "en",
            disabled: true,
            domains: ["kobato.hologfx.com"],
            home: "https://kobato.hologfx.com/",
            chapter_url: /^\/reader\/read\/.+$/g,
            canListFullMangas: false /* to avoid loading 4 pages to load all mangas */,

            abstract: "FoolSlide",
            abstract_options: {
                base_url: "https://kobato.hologfx.com/reader",
                search_all: false /* use FoolSlide search function */,
                mglist_selector: ".title > a[href*='/series/']"
            }
        }),
        new DisabledMirror({
            disabled: true,
            mirrorName: "Dokusha",
            mirrorIcon: require("../../icons/dokusha-optimized.png"),
            languages: "en",
            domains: ["dokusha.info"],
            home: "http://dokusha.info",
            chapter_url: /^\/read\/.+$/g,

            abstract: "FoolSlide",
            abstract_options: {
                base_url: "http://dokusha.info",
                mglist_selector: ".title > a[href*='/series/']"
            }
        }),
        new DisabledMirror({
            mirrorName: "MangaDex",
            canListFullMangas: false,
            mirrorIcon: "mangadex.png",
            languages: [
                "en",
                "sa",
                "bd",
                "bg",
                "ct",
                "cn",
                "hk",
                "cz",
                "dk",
                "nl",
                "gb",
                "ph",
                "fi",
                "fr",
                "de",
                "gr",
                "hu",
                "id",
                "it",
                "jp",
                "kr",
                "my",
                "mn",
                "ir",
                "pl",
                "br",
                "pt",
                "ro",
                "ru",
                "rs",
                "es",
                "mx",
                "se",
                "th",
                "tr",
                "ua",
                "vn"
            ].join(","),
            domains: ["*.mangadex.org", "mangadex.org"],
            home: "https://www.mangadex.org/",
            chapter_url: /\/chapter\/.*/g,
            api: "https://api.mangadex.org/v2/",
            disabled: true
        }),
        new DisabledMirror({
            mirrorName: "Manga Reader",
            canListFullMangas: false,
            disabled: true,
            mirrorIcon: require("../../icons/mangareader-optimized.png"),
            domains: ["www.mangareader.net"],
            home: "http://www.mangareader.net",
            chapter_url: /\/.*\/[0-9]+.*/g,
            languages: "en"
        }),
        new DisabledMirror({
            mirrorName: "Manga Rock",
            disabled: true,
            canListFullMangas: false,
            mirrorIcon: require("../../icons/mangarock-optimized.png"),
            languages: "en",
            domains: ["mangarock.com"],
            home: "https://mangarock.com/",
            chapter_url: /\/manga\/.*\/chapter\/.*/g,
            api: "https://api.mangarockhd.com/query/web401/"
        }),
        new DisabledMirror({
            mirrorName: "MangaStream",
            mirrorIcon: require("../../icons/mangastream-optimized.png"),
            languages: "en",
            domains: ["www.mangastream.cc"],
            home: "https://www.mangastream.cc/",
            chapter_url: /^\/(manhwa|comic|manga|webtoon|manhua|series)\/.*\/.+$/g,
            canListFullMangas: false,
            abstract: "Madara",
            disabled: true,
            abstract_options: {
                search_url: "https://www.mangastream.cc/"
            }
        }),
        new DisabledMirror({
            mirrorName: "Non Stop Scans",
            mirrorIcon: NonStopScansIcon,
            languages: "en",
            domains: ["www.nonstopscans.com"],
            home: "https://www.nonstopscans.com/",
            chapter_url: /^\/\d.+-.+?/g,
            canListFullMangas: false,
            abstract: "MangaStream_1_1_4",
            abstract_options: {
                base_url: "https://nonstopscans.com/"
            }
        })
    ]
}
