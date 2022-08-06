import Axios from "axios"
import { formatMangaName } from "../shared/utils"
import { sanitizeDom } from "../amr/domutils"
import { MirrorLoader } from "../mirrors/MirrorLoader"
import { MirrorImplementation } from "../types/common"

/**
 * Runs implementation functions for the lab
 */
export class HandleLab {
    constructor(private mirrorLoader: MirrorLoader<MirrorImplementation>) {}

    handle(message) {
        if ("lab" === message.action) {
            if (message.url && message.url.indexOf("//") === 0) {
                message.url = "http:" + message.url
            }
            return this.runFunction(message)
        }
    }
    async runFunction(message) {
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
            return this.loadChapterAndDo(message, impl)
        }

        if (message.torun === "getScanUrl") {
            return impl.getImageUrlFromPage(message.url)
        }
    }
    async loadChapterAndDo(message, impl) {
        return Axios.get(message.url)
            .then(resp => {
                return new Promise(async (resolve, reject) => {
                    try {
                        let htmlDocument = sanitizeDom(resp.data)

                        //once the response has been parsed
                        if (message.task === "containScans") {
                            resolve(impl.isCurrentPageAChapterPage(htmlDocument, message.url))
                        } else if (message.task === "informations") {
                            let infos = await impl.getInformationsFromCurrentPage(htmlDocument, message.url)
                            resolve(infos)
                        } else if (message.task === "listScans") {
                            let imagesUrl = await impl.getListImages(htmlDocument, message.url)
                            resolve(imagesUrl)
                        }
                    } catch (e) {
                        reject(e)
                    }
                })
            })
            .catch(e => {
                return Promise.reject(e)
            })
    }
}
