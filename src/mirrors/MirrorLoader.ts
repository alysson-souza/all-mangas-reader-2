import { MirrorImplementation, MirrorObject } from "../types/common"
import { getDisabledImplementations } from "./sites/disabled/DisabledImplementations"

import { getMangaKakalotImplementations } from "./sites/abstract/MangakakalotAbs"
import { getMadaraImplementations } from "./sites/Madara/MadaraImplementations"
import { getMangaStreamImplementations } from "./sites/MangaStream/MangaStream"
import { getMangaStream114Implementations } from "./sites/MangaStream/MangaStream_1_1_4"
import { getFoolSlideImplementations } from "./sites/FoolSlide/FoolSlide"
import { getFunMangaImplementations } from "./sites/abstract/FunManga"
import { getMyMangaReaderCMSMirrors } from "./sites/MyMangaReaderCMS/MyMangaReaderCMS"
import { getReadMangaMirrors } from "./sites/ReadManga/ReadManga"

import { MirrorHelper } from "./MirrorHelper"
import { Manga4Life } from "./sites/Manga4Life"
import { MangaFox } from "./sites/MangaFox"
import { MangaHub } from "./sites/MangaHub"
import { MangaHere } from "./sites/MangaHere"
import { WebToon } from "./sites/WebToon"
import { ZeroScans } from "./sites/ZeroScans"
import { MangadexV5 } from "./sites/Mangadex-V5"
import { ZaHardTop } from "./sites/ZaHardTop"
import { UnionLeitor } from "./sites/UnionLeitor"
import { Tachidesk } from "./sites/Tachidesk"
import { SeriManga } from "./sites/SeriManga"
import { ScyllaScans } from "./sites/ScyllaScans"
import { ScanTradUnion } from "./sites/ScanTradUnion"
import { SadScans } from "./sites/SadScans"
import { ReadM } from "./sites/ReadM"
import { ReadComicOnline } from "./sites/ReadComicOnline"
import { Niceoppai } from "./sites/Niceoppai"
import { NHentai } from "./sites/NHentai"
import { Manhwa18com } from "./sites/Manhwa18.com"
import { ManhwaFreak } from "./sites/ManhwaFreak"
import { MangaSee } from "./sites/MangaSee"
import { MangaPill } from "./sites/MangaPill"
import { MangaDemon } from "./sites/MangaDemon"
import { MangaKawaii } from "./sites/MangaKawaii"
import { MangaKatana } from "./sites/MangaKatana"
import { MangaHasu } from "./sites/MangaHasu"
import { MangaFreak } from "./sites/MangaFreak"
import { MangaAlArab } from "./sites/MangaAlArab"
import { LugnicaScan } from "./sites/LugnicaScan"
import { Komga } from "./sites/Komga"
import { FMTeam } from "./sites/FMTeam"
import { EpsilonScan } from "./sites/EpsilonScan"
import { BananaScan } from "./sites/BananaScan"
import { BatotoFake } from "./sites/Batoto-fake"
import { DynastyScans } from "./sites/DynastyScans"
import { DisasterScans } from "./sites/DisasterScans"
import { Dm5 } from "./sites/Dm5"
import { ReaperScans } from "./sites/ReaperScans"
import { LikeManga } from "./sites/LikeManga"
import { MangaPark } from "./sites/MangaPark"

export class MirrorLoader {
    lookupMap: Map<string, MirrorImplementation>

    constructor(private mirrors: MirrorImplementation[]) {
        this.lookupMap = new Map(mirrors.map(mirror => [mirror.mirrorName, mirror]))
    }

    async getImpl(name: string) {
        return this.lookupMap.get(name)
    }
    getMirror(name: string) {
        return this.toMirror(this.lookupMap.get(name))
    }

    getAll() {
        return Array.from(this.lookupMap.values()).map(m => this.toMirror(m))
    }

    hasMirror(mirrorName: string) {
        return this.lookupMap.has(mirrorName)
    }

    private toMirror(m: MirrorImplementation): MirrorObject {
        // Ensure we clone the object properties, so it will not mutate original object
        return {
            mirrorName: m.mirrorName,
            canListFullMangas: m.canListFullMangas,
            mirrorIcon: m.mirrorIcon,
            domains: [...m.domains],
            home: m.home,
            chapter_url: new RegExp(m.chapter_url),
            languages: m.languages,
            disabled: m.disabled
        }
    }
}

let instance: MirrorLoader
export const getMirrorLoader = (mirrorHelper: MirrorHelper) => {
    if (!instance) {
        instance = new MirrorLoader([
            ...getFoolSlideImplementations(mirrorHelper),
            ...getFunMangaImplementations(mirrorHelper),
            ...getMadaraImplementations(mirrorHelper),
            ...getMangaStreamImplementations(mirrorHelper),
            ...getMangaStream114Implementations(mirrorHelper),
            ...getMangaKakalotImplementations(mirrorHelper),
            ...getMyMangaReaderCMSMirrors(mirrorHelper),
            ...getReadMangaMirrors(mirrorHelper),
            new MangadexV5(mirrorHelper),
            new WebToon(mirrorHelper),
            new MangaFox(mirrorHelper),
            new MangaHere(mirrorHelper),
            new Manga4Life(mirrorHelper),
            new MangaHub(mirrorHelper),
            new ZeroScans(mirrorHelper),
            new ZaHardTop(mirrorHelper),
            new UnionLeitor(mirrorHelper),
            new Tachidesk(mirrorHelper),
            new SeriManga(mirrorHelper),
            new ScyllaScans(mirrorHelper),
            new ScanTradUnion(mirrorHelper),
            new SadScans(mirrorHelper),
            new ReadM(mirrorHelper),
            new ReadComicOnline(mirrorHelper),
            new Niceoppai(mirrorHelper),
            new NHentai(mirrorHelper),
            new Manhwa18com(mirrorHelper),
            new ManhwaFreak(mirrorHelper),
            new MangaSee(mirrorHelper),
            new MangaPill(mirrorHelper),
            new MangaDemon(mirrorHelper),
            new MangaKawaii(mirrorHelper),
            new MangaKatana(mirrorHelper),
            new MangaHasu(mirrorHelper),
            new MangaFreak(mirrorHelper),
            new MangaAlArab(mirrorHelper),
            new LugnicaScan(mirrorHelper),
            new Komga(mirrorHelper),
            new FMTeam(mirrorHelper),
            new EpsilonScan(mirrorHelper),
            new BananaScan(mirrorHelper),
            new BatotoFake(mirrorHelper),
            new DynastyScans(mirrorHelper),
            new DisasterScans(mirrorHelper),
            new Dm5(mirrorHelper),
            new ReaperScans(mirrorHelper),
            new LikeManga(mirrorHelper),
            new MangaPark(mirrorHelper),

            // Must be last, as we sometimes select based on same matching
            // domains (MangaDex), therefore we should prefer active ones first
            ...getDisabledImplementations()
        ])
    }
    return instance
}
