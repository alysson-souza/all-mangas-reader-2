/**
 * State of bookmarks linked to the current chapter
 * Helpers to load / save / delete bookmarks
 */
import browser from "webextension-polyfill"

import pageData from "./pagedata"

export default {
    state: {
        booked: false, // true if chapter is booked
        note: undefined, // note of current chapter
        scans: [] // list of scans [{url, name, note, booked}]
    },

    mirror: {
        mirrorName: ""
    },

    /** Initialize state with a whole list of scans urls */
    init(scansUrl, mirror) {
        this.mirror = mirror
        // initialize chapter
        this.loadBookmark()
        // initialize scans
        this.state.scans.push(
            ...scansUrl.map((url, i) => {
                return {
                    index: i,
                    url: url,
                    name: "" + (i + 1),
                    booked: false,
                    note: undefined
                }
            })
        )
        for (let scUrl of scansUrl) {
            this.loadBookmark({ scanUrl: scUrl })
        }
    },

    /** retrieve a scan from state */
    getScan(scanUrl) {
        return this.state.scans.find(scan => scan.url === scanUrl)
    },

    /** Save a bookmark */
    async saveBookmark({ note, scanUrl, scanName } = {}) {
        let obj = {
            action: "addUpdateBookmark",
            mirror: this.mirror.mirrorName,
            url: pageData.state.currentMangaURL,
            chapUrl: pageData.state.currentChapterURL,
            name: pageData.state.name,
            chapName: pageData.state.currentChapter,
            note: note
        }
        if (!scanUrl) {
            obj.type = "chapter"
        } else {
            obj.type = "scan"
            obj.scanUrl = scanUrl
            obj.scanName = scanName
        }
        await browser.runtime.sendMessage(obj)

        if (!scanUrl) {
            this.state.note = note
            this.state.booked = true
        } else {
            let sc = this.getScan(scanUrl)
            if (sc) {
                sc.note = note
                sc.booked = true
            }
        }
    },
    /** Delete a bookmark */
    async deleteBookmark({ scanUrl } = {}) {
        let obj = {
            action: "deleteBookmark",
            mirror: this.mirror.mirrorName,
            url: pageData.state.currentMangaURL,
            chapUrl: pageData.state.currentChapterURL
        }
        if (!scanUrl) {
            obj.type = "chapter"
        } else {
            obj.type = "scan"
            obj.scanUrl = scanUrl
        }
        await browser.runtime.sendMessage(obj)

        if (!scanUrl) {
            this.state.note = undefined
            this.state.booked = false
        } else {
            let sc = this.getScan(scanUrl)
            if (sc) {
                sc.note = undefined
                sc.booked = false
            }
        }
    },

    /** Check data for a bookmark from server */
    async loadBookmark({ scanUrl } = {}) {
        let obj = {
            action: "getBookmarkNote",
            mirror: this.mirror.mirrorName,
            url: pageData.state.currentMangaURL,
            chapUrl: pageData.state.currentChapterURL
        }
        if (!scanUrl) {
            obj.type = "chapter"
        } else {
            obj.type = "scan"
            obj.scanUrl = scanUrl
        }
        let result = await browser.runtime.sendMessage(obj)

        if (!scanUrl) {
            this.state.note = result.note
            this.state.booked = result.isBooked
        } else {
            let sc = this.getScan(scanUrl)
            if (sc) {
                sc.note = result.note
                sc.booked = result.isBooked
            }
        }
    }
}
