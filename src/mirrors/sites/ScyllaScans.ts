import { BaseMirror } from "./abstract/BaseMirror"
import { MirrorImplementation } from "../../types/common"
import { MirrorHelper } from "../MirrorHelper"
import ScyllaScansIcon from "../icons/serimanga-optimized.png"

export class ScyllaScans extends BaseMirror implements MirrorImplementation {
    constructor(amrLoader: MirrorHelper) {
        super(amrLoader)
    }

    mirrorName = "Scylla Scans"
    canListFullMangas = true
    mirrorIcon = ScyllaScansIcon
    languages = "en"
    domains = ["scyllascans.org"]
    home = "https://scyllascans.org/"
    apiUrl = "https://api.scyllascans.org/"
    chapter_url = /\/(read).*/g

    async fetchGraphQl(query, variables) {
        const { data } = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query,
                variables
            })
        }).then(res => res.json())

        return data
    }

    async getMangaList(search: string) {
        const query = `
            query works($orderBy: String, $sortBy: String, $first: Int, $offset: Int, $languages: [Int], $showHidden: Boolean) {
                works(orderBy: $orderBy, sortBy: $sortBy, first: $first, offset: $offset, languages: $languages, showHidden: $showHidden) {
                name
                language_name
                stub
                }
            }
            `

        const { works } = await this.fetchGraphQl(query, {
            orderBy: "asc",
            sortBy: "id",
            first: 1000,
            offset: 0,
            languages: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            showHidden: true
        })

        return works.map(({ name, language_name, stub }) => {
            return [name, "https://scyllascans.org/work/" + language_name + "/" + stub]
        })
    }

    async getListChaps(url) {
        const query = `
            query chaptersByWork($workStub: String, $languages: [Int], $showHidden: Boolean) {
                chaptersByWork(workStub: $workStub, languages: $languages, showHidden: $showHidden) {
                    chapter
                    subchapter
                    read_path
                }
            }
        `
        const { chaptersByWork } = await this.fetchGraphQl(query, {
            workStub: url.match(/([^\/]*)$/)[0],
            languages: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            showHidden: true
        })

        return chaptersByWork.map(({ chapter, subchapter, read_path }) => {
            if (subchapter != 0) chapter = chapter + "." + subchapter
            return [chapter, this.home.replace(/\/$/, "") + read_path]
        })
    }

    getChapterInfo(curUrl: String) {
        const dataFromUrl = curUrl.match(/(?<=read\/)(.*)/)[0].split("/")
        const [workStub, language, volume] = dataFromUrl
        const [chapter, subChapter] = dataFromUrl[3].split(".")
        const langIdentifiers = {
            en: 2
        }

        return {
            workStub,
            languageId: langIdentifiers[language],
            language: language,
            chapter: parseInt(chapter),
            volume: parseInt(volume),
            subChapter: parseInt(subChapter)
        }
    }

    async getCurrentPageInfo(doc, curUrl) {
        const { workStub, language } = this.getChapterInfo(curUrl)

        const $ = this.parseHtml(doc)

        return {
            name: $('a[class*="ReaderControlsWork"]').attr("title"),
            currentMangaURL: this.home + "work/" + language + "/" + workStub,
            currentChapterURL: curUrl
        }
    }

    async getListImages(doc, curUrl, sender) {
        const query = `
            query chapterByWorkAndChapter($workStub: String, $language: Int, $volume: Int, $chapter: Int, $subChapter: Int, $showHidden: Boolean) {
                chapterByWorkAndChapter(workStub: $workStub, language: $language, volume: $volume, chapter: $chapter, subchapter: $subChapter, showHidden: $showHidden) {
                    uniqid
                    work {
                        uniqid
                    }
                pages {
                        filename
                    }
                }
            }
        `

        const { languageId, workStub, chapter, subChapter, volume } = this.getChapterInfo(curUrl)
        const { chapterByWorkAndChapter: cha } = await this.fetchGraphQl(query, {
            workStub,
            language: languageId,
            chapter,
            subChapter,
            volume,
            showHidden: true
        })
        const startUrl = `${this.apiUrl}/works/${cha.work.uniqid}/${cha.uniqid}`
        return cha.pages.map(page => `${startUrl}/${page.filename}?strip=all&quality=100`)
    }

    isCurrentPageAChapterPage(doc, curUrl) {
        return this.chapter_url.test(curUrl)
    }

    async getImageUrlFromPage(urlImage: string): Promise<string> {
        return urlImage
    }
}
