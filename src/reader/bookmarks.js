/**
 * State of bookmarks linked to the current chapter
 * Helpers to load / save / delete bookmarks
 */
import browser from "webextension-polyfill";

import mirrorImpl from '../content/mirrorimpl';
import pageData from '../content/pagedata';

export default {
    state: {
        booked: false, // true if chapter is booked
        note: undefined, // note of current chapter
        scans: [], // list of scans [{url, name, note, booked}]
    },

    /** Initialize state with a whole list of scans urls */
    init(scansUrl) {
        // initialize chapter
        this.loadBookmark()
        // initialize scans
        this.state.scans.push(
            ...scansUrl.map((url, i) => { 
                return {
                    url: url, 
                    name: "" + (i + 1), 
                    booked: false,
                    note: undefined
                }
            })
        )
        for (let scUrl of scansUrl) {
            this.loadBookmark({scanUrl: scUrl})
        }
        console.log(this.state.scans)
    },

    /** retrieve a scan from state */
    getScan(scanUrl) {
        return this.state.scans.find(scan => scan.url === scanUrl)
    },

    /** Save a bookmark */
    async saveBookmark({ note, scanUrl, scanName } = {}) {
        let obj = {
            action: "addUpdateBookmark",
            mirror: mirrorImpl.get().mirrorName,
            url: pageData.currentMangaURL,
            chapUrl: pageData.currentChapterURL,
            name: pageData.name,
            chapName: pageData.currentChapter,
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
            mirror: mirrorImpl.get().mirrorName,
            url: pageData.currentMangaURL,
            chapUrl: pageData.currentChapterURL
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
            mirror: mirrorImpl.get().mirrorName,
            url: pageData.currentMangaURL,
            chapUrl: pageData.currentChapterURL,
        };
        if (!scanUrl) {
            obj.type = "chapter"
        } else {
            obj.type = "scan"
            obj.scanUrl = scanUrl
        }
        let result = await browser.runtime.sendMessage(obj);

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