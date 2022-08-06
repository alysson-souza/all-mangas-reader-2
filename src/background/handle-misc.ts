import browser from "webextension-polyfill"
import * as zip from "@zip.js/zip.js"
import saveAs from "file-saver"
import mimedb from "mime-db"
import axios from "axios"
import { AppStore } from "../types/common"
import { MirrorLoader } from "../mirrors/MirrorLoader"

zip.configure({ useWebWorkers: false })

export class HandleMisc {
    constructor(private readonly store: AppStore, private readonly mirrorLoader: MirrorLoader) {}

    async handle(message) {
        switch (message.action) {
            // get options array
            case "opentab":
                return browser.tabs.create({ url: message.url })
            case "mirrorInfos":
                // @TODO deprecate and load directly from mirrorLoader
                const mirror = this.mirrorLoader.getMirror(message.name)
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
                return { result: false }
            case "fetchImage":
                return this.store.dispatch("fetchImage", message)
            case "DownloadChapter":
                return this.DownloadChapter(message)
        }
    }

    async DownloadChapter(message) {
        const { urls, chapterName, seriesName } = message
        // setup zip
        const blobWriter = new zip.BlobWriter("application/zip")
        const writer = new zip.ZipWriter(blobWriter)
        for (const [i, url] of urls.entries()) {
            let ext = "jpg"
            // @TODO this probably not working and should be using fetch
            const resp = await axios.get(url, { responseType: "blob" })

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
            const name = `${String(i + 1).padStart(3, "0")}.${ext}`
            await writer.add(name, new zip.BlobReader(content))
        }
        const blob = await blobWriter.getData()
        saveAs(blob, `${seriesName} - ${chapterName}.cbz`)

        return true
    }
}
