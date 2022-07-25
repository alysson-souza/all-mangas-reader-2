import mirrorsImpl from "../amr/mirrors-impl"
import Axios from "axios"
import { formatMangaName } from "../shared/utils"
import { sanitizeDom } from "../amr/domutils"

/**
 * Runs implementation functions for the lab
 */
export class HandleLab {
    handle(message) {
        if ("lab" === message.action) {
            if (message.url && message.url.indexOf("//") === 0) {
                message.url = "http:" + message.url
            }
            return this.runFunction(message)
        }
    }
    async runFunction(message) {
        const impl = await mirrorsImpl.getImpl(message.mirror)

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
            let img = new Image()
            await impl.getImageFromPageAndWrite(message.url, img)
            return new Promise(resolve => {
                ;(function wait() {
                    if (img.src && img.src != "") {
                        return resolve(img.src)
                    }
                    setTimeout(wait, 100)
                })()
            })
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
