import mirrorsImpl from "../amr/mirrors-impl"
import Axios from "axios"
import * as domutils from "../amr/domutils"
import * as utils from "../amr/utils"

/**
 * Runs implementation functions for the lab
 */
class HandleLab {
    handle(message, sender) {
        if ("lab" === message.action) {
            if (message.url && message.url.indexOf("//") === 0) message.url = "http:" + message.url
            return this.runFunction(message)
        }
    }
    async runFunction(message) {
        // load implementation for mirror
        return new Promise(async (resolve, reject) => {
            try {
                let impl = await mirrorsImpl.getImpl(message.mirror)
                if (message.torun === "search") {
                    let res = await impl.getMangaList(message.search)
                    if (impl.canListFullMangas) {
                        res = res.filter(
                            arr => utils.formatMgName(arr[0]).indexOf(utils.formatMgName(message.search)) !== -1
                        )
                    }
                    resolve(res)
                } else if (message.torun === "chapters") {
                    let lst = await impl.getListChaps(message.url)
                    resolve(lst)
                } else if (message.torun === "loadChapterAndDo") {
                    let res = this.loadChapterAndDo(message, impl)
                    resolve(res)
                } else if (message.torun === "getScanUrl") {
                    let img = new Image()
                    await impl.getImageFromPageAndWrite(message.url, img)
                    ;(function wait() {
                        if (img.src && img.src != "") {
                            return resolve(img.src)
                        }
                        setTimeout(wait, 100)
                    })()
                }
            } catch (e) {
                reject(e)
            }
        })
    }
    async loadChapterAndDo(message, impl) {
        return Axios.get(message.url)
            .then(resp => {
                return new Promise(async (resolve, reject) => {
                    try {
                        let htmlDocument = domutils.sanitizeDom(resp.data)

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
export default new HandleLab()
