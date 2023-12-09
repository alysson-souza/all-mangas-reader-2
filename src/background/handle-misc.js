import browser from "webextension-polyfill"
import * as zip from "@zip.js/zip.js"
import saveAs from "file-saver"
import mimedb from "mime-db"
import axios from "axios"
import amrUpdater from "../amr/amr-updater"

zip.configure({
    useWebWorkers: false
})

class HandleMisc {
    handle(message, sender) {
        switch (message.action) {
            // get options array
            case "opentab":
                browser.tabs.create({
                    url: message.url
                })
                return Promise.resolve()
            case "mirrorInfos":
                let mirror = window["AMR_STORE"].state.mirrors.all.find(mir => mir.mirrorName === message.name)
                return Promise.resolve({
                    // can't send a vuex object through js instances on Firefox --> convert
                    activated: mirror.activated,
                    domains: mirror.domains,
                    home: mirror.home,
                    languages: mirror.languages,
                    mirrorIcon: mirror.mirrorIcon,
                    mirrorName: mirror.mirrorName
                })
            case "reloadStats":
                return Promise.resolve(/*statsEvents.reloadStats()*/)
            case "fetchImage":
                return window["AMR_STORE"].dispatch("fetchImage", message)
            case "DownloadChapter":
                return this.DownloadChapter(message)
        }
    }
    async DownloadChapter(message) {
        return new Promise(async (resolve, reject) => {
            const { urls, chapterName, seriesName } = message

            // setup zip
            const blobWriter = new zip.BlobWriter("application/zip")
            const writer = new zip.ZipWriter(blobWriter)
            for (const [i, url] of urls.entries()) {
                let ext = "jpg"
                const resp = await axios.get(url, { responseType: "blob" }).catch(reject)
                // const res = await fetch(url).catch(e=> this.zip = false)
                // const content = await res.blob().catch(e=> this.zip = false)
                const content = resp.data
                const mime = content.type
                if (mime.indexOf("image") > -1) {
                    if (mimedb[mime].extensions) {
                        ext = mimedb[mime].extensions[0]
                    } else {
                        const match = url.match(/(\.\w{2,4})(?![^?])/)
                        if (match) {
                            ext = match[1].replace(".", "")
                        }
                    }
                }
                await writer.add(String(i + 1).padStart(3, "0") + "." + ext, new zip.BlobReader(content))
            }
            // const blob = await blobWriter.getData()
            // saveAs(blob, `${seriesName} - ${chapterName}.cbz`)
            saveAs(await writer.close(), `${seriesName} - ${chapterName}.cbz`)
            resolve()
        })
    }
}
export default new HandleMisc()
