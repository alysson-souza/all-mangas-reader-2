import { DisabledMirror } from "../DisabledMirror"
import Manwha18netIcon from "../../../icons/manwha18-optimized.png"

export class Manwha18net extends DisabledMirror {
    constructor() {
        super({
            mirrorName: "Manwha18.net",
            canListFullMangas: false,
            mirrorIcon: Manwha18netIcon,
            languages: "en",
            domains: ["manwha18.net"],
            home: "http://manwha18.net/",
            chapter_url: /read-.*-chapter-.*/g,
            disabled: true
        })
    }
    /*
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Manwha18.net"
    canListFullMangas = false
    mirrorIcon = Manwha18netIcon
    languages = "en"
    domains = ["manwha18.net"]
    home = "http://manwha18.net/"
    chapter_url = /read-.*-chapter-.*/ g

    /*async getMangaList(search: string) {
        let doc = await this.mirrorHelper.loadPage(this.home + "app/manga/controllers/cont.search.php?keyword=" + search, {
            nocache: true,
            preventimages: true
        })

        let res = []
        let _self = this
        const $ = this.parseHtml(doc)

        $(`a.item`).each(function (ind) {
            // remove leading slash from $(this).attr('href') if present
            let link = $(this).attr("href")
            if (link.charAt(0) === "/") link = link.substring(1)

            res.push([$("h6", this).text(), _self.home + link])
        })
        return res
    }

    async getListChaps(urlManga) {
        let doc = await this.mirrorHelper.loadPage(urlManga, { nocache: true, preventimages: true })
        let res = []
        const $ = this.parseHtml(doc)
        let _self = this
        $(`ul.list-chapters a`).each(function (index) {
            // remove leading slash from $(this).attr('href') if present
            let link = $(this).attr("href")
            if (link.charAt(0) === "/") link = link.substring(1)

            res.push([
                $(".chapter-name", this)
                    .text()
                    .replace(/chapter|chap|ch/g, "")
                    .trim(),
                _self.home + link
            ])
        })
        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        let link = $($("nav .breadcrumb > .breadcrumb-item > a")[2])

        return {
            name: link.text(),
            currentMangaURL: link.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        let res = []
        const $ = this.parseHtml(doc)

        $(`img.chapter-img`).each(function () {
            res.push($(this).attr("data-original"))
        })
        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.queryHtml(doc, "img.chapter-img").length > 0
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }*/
}
