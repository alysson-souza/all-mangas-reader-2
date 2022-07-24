import { IconHelper } from "../amr/icon-helper"
import Axios from "axios"
import store from "../store"

/**
 * This class is used to update periodically manga chapters lists and mirrors list
 */
export class Updater {
    constructor(store) {
        this.store = store
        this.iconHelper = new IconHelper(store)
    }

    /**
     * Initialize refresh checkers
     */
    load() {
        this.checkChaptersUpdates()
        this.checkMirrorsUpdates()
    }

    /**
     * Check if we need to refresh chapters lists according to frequency every minutes
     */
    checkChaptersUpdates() {
        let lastUpdt = this.store.state.options.lastChaptersUpdate
        let frequency = this.store.state.options.updatechap
        if (navigator.onLine && lastUpdt + frequency < Date.now()) {
            // time to refresh !
            this.store.dispatch("updateChaptersLists", { force: false }) // force to false to avoid updating if not necessary
        }
        setTimeout(this.checkChaptersUpdates.bind(this), 60 * 1000) // check every minutes
    }

    /**
     * Check if we need to refresh mirrors lists according to frequency every minutes
     */
    checkMirrorsUpdates() {
        let lastUpdt = this.store.state.options.lastMirrorsUpdate
        let frequency = this.store.state.options.updatemg
        if (navigator.onLine && lastUpdt + frequency < Date.now()) {
            // time to refresh !
            this.store.dispatch("updateMirrorsLists")
            this.checkLatestPublishedVersion()
        }
        setTimeout(this.checkMirrorsUpdates.bind(this), 60 * 1000) // check every minutes
    }

    /**
     * Check latest version of stable and beta and keep it in localStorage
     */
    async checkLatestPublishedVersion() {
        let vstable = await this.getVersionFromChromeUpdateFile(
                "https://release.allmangasreader.com/update/chrome.xml"
            ),
            vbeta = await this.getVersionFromChromeUpdateFile(
                "https://release.allmangasreader.com/update/chrome-beta.xml"
            )
        if (vstable) {
            localStorage.latestStableVersion = vstable.version
            //localStorage.latestStableUrl = vstable.url
        }
        if (vbeta) {
            localStorage.latestBetaVersion = vbeta.version
            //localStorage.latestBetaUrl = vbeta.url
        }
    }

    async getVersionFromChromeUpdateFile(url) {
        let config = {
            headers: {
                "Cache-Control": "no-cache"
            }
        }
        let res = await Axios.get(url, config).catch(e => {
            console.error("Failed to load " + url)
            console.error(e)
            return e
        })
        if (res && res.data) {
            const regex = /codebase\=\'(.[^\']*)\'(\s+)version\=\'(.[^\']*)\'/gm
            let m = regex.exec(res.data)
            if (m) {
                return { version: m[3], url: m[1] }
            }
        }
    }

    /**
     * Refresh badge and icon
     */
    refreshBadgeAndIcon() {
        this.iconHelper.refreshBadgeAndIcon()
    }
}

export default new Updater(store)
