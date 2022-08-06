import i18n from "../amr/i18n"
import browser from "webextension-polyfill"
import { AppStore, MirrorImplementation } from "../types/common"
import { mangaKey } from "../shared/utils"
import { MirrorLoader } from "../mirrors/MirrorLoader"

export class HandleBookmarks {
    private context_ids: string[]

    constructor(private store: AppStore, private mirrorLoader: MirrorLoader<MirrorImplementation>) {
        this.context_ids = []
    }
    async handle(message, sender) {
        switch (message.action) {
            case "getBookmarkNote":
                const noteBM = this.getBookmark(message)
                return {
                    isBooked: noteBM.booked,
                    note: noteBM.note,
                    scanSrc: noteBM.scanSrc
                }
            case "deleteBookmark":
                this.deleteBookmark(message)
                return {}
            case "addUpdateBookmark":
                this.addBookmark(message)
                return Promise.resolve({})
            case "createContextMenu":
                let url = message.lstUrls[0]
                if (this.context_ids.indexOf(url) < 0) {
                    this.context_ids.push(url)
                    let id = browser.contextMenus.create({
                        title: i18n("background_bookmark_menu"),
                        contexts: ["image", "link"],
                        onclick: function (info, tab) {
                            browser.scripting.executeScript({
                                target: { tabId: tab.id },
                                func: function (srcUrl) {
                                    if (typeof globalThis.clickOnBM === "function") {
                                        globalThis.clickOnBM(srcUrl)
                                    }
                                },
                                args: [info.srcUrl]
                            })
                        },
                        targetUrlPatterns: [encodeURI(url), url]
                    })
                }
                return Promise.resolve({})
            case "getScanUrl":
                return this.getScanUrl(message)
        }
    }

    /**
     * Gets a scan url
     */
    async getScanUrl(message) {
        const impl = await this.mirrorLoader.getImpl(message.mirror)
        return impl.getImageUrlFromPage(message.url)
    }
    /**
     * Find a bookmark from store
     * @param {*} obj
     */
    findBookmark(obj) {
        const prefixKey = mangaKey({
            url: obj.chapUrl,
            mirror: obj.mirror,
            rootState: this.store
        })

        const scanUrl = mangaKey({
            url: obj.scanUrl,
            mirror: obj.mirror,
            rootState: this.store
        })

        const key = prefixKey + (obj.scanUrl ? `_${scanUrl}` : "")
        return this.store.state.bookmarks.all.find(bookmark => bookmark.key === key)
    }

    getBookmark(obj) {
        let bm = this.findBookmark(obj)
        if (bm === undefined) {
            return {
                booked: false,
                note: ""
            }
        }
        if (obj.type === "chapter") {
            return {
                booked: true,
                note: bm.note
            }
        }
        return {
            booked: true,
            note: bm.note,
            scanSrc: obj.scanUrl
        }
    }

    /**
     * Adds a bookmark in store
     * @param {*} obj
     */
    addBookmark(obj) {
        let bm = this.findBookmark(obj)
        let tosave = {
            mirror: obj.mirror,
            url: obj.url,
            chapUrl: obj.chapUrl,
            type: obj.type,
            name: obj.name,
            chapName: obj.chapName,
            scanUrl: obj.scanUrl,
            scanName: obj.scanName,
            note: obj.note
        }
        if (bm === undefined) {
            // adds a new bookmark
            this.store.dispatch("createBookmark", tosave)
        } else {
            // update bookmark note
            this.store.dispatch("updateBookmarkNote", tosave)
        }
    }

    /**
     * Deletes a bookmark from store
     * @param {*} obj
     */
    deleteBookmark(obj) {
        // adds a new bookmark
        this.store.dispatch("deleteBookmark", {
            chapUrl: obj.chapUrl,
            scanUrl: obj.scanUrl,
            mirror: obj.mirror
        })
    }
}
