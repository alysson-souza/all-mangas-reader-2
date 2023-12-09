import { formatMangaName } from "../shared/utils"
import { MirrorLoader } from "../mirrors/MirrorLoader"
import { NOT_HANDLED_MESSAGE } from "./background-util"
import { MirrorImplementation, Sender } from "../types/common"

/**
 * Runs implementation functions for the lab
 */
export class HandleLab {
    constructor(private mirrorLoader: MirrorLoader) {}

    async handle(message, sender: Sender) {
        if ("lab" === message.action) {
            if (message.url && message.url.indexOf("//") === 0) {
                message.url = "http:" + message.url
            }
            return this.runFunction(message, sender)
        }

        return NOT_HANDLED_MESSAGE
    }
    async runFunction(message, sender: Sender) {
        const impl = await this.mirrorLoader.getImpl(message.mirror)

        if (message.torun === "search") {
            let res = await impl.getMangaList(message.search)
            if (impl.canListFullMangas) {
                const searchString = formatMangaName(message.search)
                res = res.filter(arr => formatMangaName(arr[0]).includes(searchString))
            }
            return res
        }

        if (message.torun === "chapters") {
            return impl.getListChaps(message.url)
        }

        if (message.torun === "loadChapterAndDo") {
            return this.loadChapterAndDo(message, impl, sender)
        }

        if (message.torun === "getScanUrl") {
            return impl.getImageUrlFromPage(message.url)
        }
    }
    async loadChapterAndDo(message, impl: MirrorImplementation, sender: Sender) {
        const resp = await fetch(message.url)
        const htmlDocument = await resp.text()

        switch (message.task) {
            case "containScans":
                return impl.isCurrentPageAChapterPage(htmlDocument, message.url)
            case "informations":
                return impl.getCurrentPageInfo(htmlDocument, message.url)
            case "listScans":
                return impl.getListImages(htmlDocument, message.url, sender)
            default:
                throw new Error(`Unsupported task ${message.task}`)
        }
    }
}
