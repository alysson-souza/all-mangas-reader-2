import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import MangaParkIcon from "../icons/manga-park-optimized.png"

export class MangaPark extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "MangaPark"
    canListFullMangas = false
    mirrorIcon = MangaParkIcon
    languages = "en"
    domains = ["mangapark.com", "mangapark.net"]
    home = "https://mangapark.net"
    apiUrl = "https://mangapark.net/apo/"
    chapter_url = /^\/title\/.*\/\d+-ch-\d.+/g

    async getMangaList(search: string) {
        const res = []
        const query = `
            query get_searchComic($select: SearchComic_Select) {
                get_searchComic(select: $select) {
                    items {
                        data {
                            name
                            tranLang
                            urlPath
                        }
                    }
                }
            }
        `
        const variables = {
            select: {
                word: search,
                incTLangs: ["en"]
            }
        }
        const data = {
            query,
            variables
        }
        const response = await this.mirrorHelper.loadJson(this.apiUrl, {
            data,
            method: "POST"
        })

        for (const series of response.data.get_searchComic.items) {
            res.push([series.data.name, this.home + series.data.urlPath])
        }

        return res
    }

    async getListChaps(urlManga) {
        const parts = urlManga.split("/").pop().split("-")

        const res = []
        const query = `
            query Get_comicChapterList($comicId: ID!) {
                get_comicChapterList(comicId: $comicId) {
                    data {
                        dateCreate
                        dname
                        title
                        urlPath
                    }
                } 
            }
        `
        const variables = {
            comicId: parts[0]
        }
        const data = {
            query,
            variables
        }
        const response = await this.mirrorHelper.loadJson(this.apiUrl, {
            data,
            method: "POST"
        })

        for (const chapter of response.data.get_comicChapterList.sort(
            (a, b) => b.data.dateCreate - a.data.dateCreate
        )) {
            res.push([
                chapter.data.dname +
                    (chapter.data.title !== null && chapter.data.title.length > 0 ? " - " + chapter.data.title : ""),
                this.home + chapter.data.urlPath
            ])
        }

        return res
    }

    async getCurrentPageInfo(doc, curUrl) {
        const $ = this.parseHtml(doc)
        var mgtitle = $("h3 a[href*='/title/']")

        return {
            name: mgtitle.text(),
            currentMangaURL: this.home + mgtitle.attr("href"),
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl) {
        const parts = curUrl.split("/").pop().split("-")

        const res = []
        const query = `
            query Get_chapterNode($getChapterNodeId: ID!) {
                get_chapterNode(id: $getChapterNodeId) {
                    data {
                        imageFile {
                            urlList
                        }
                    }
                }
            }
        `
        const variables = {
            getChapterNodeId: parts[0]
        }
        const data = {
            query,
            variables
        }
        const response = await this.mirrorHelper.loadJson(this.apiUrl, {
            data,
            method: "POST"
        })

        for (const image of response.data.get_chapterNode.data.imageFile.urlList) {
            res.push(image)
        }

        return res
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        const pathname = new URL(curUrl).pathname
        return this.chapter_url.test(pathname)
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
