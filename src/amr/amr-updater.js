import iconHelper from "./icon-helper"
import Axios from "axios"

/**
 * This class is used to update periodically manga chapters lists and mirrors list
 */
class Updater {
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
        let lastUpdt = window["AMR_STORE"].state.options.lastChaptersUpdate
        let frequency = window["AMR_STORE"].state.options.updatechap
        if (navigator.onLine && lastUpdt + frequency < Date.now()) {
            // time to refresh !
            window["AMR_STORE"].dispatch("updateChaptersLists", { force: false }) // force to false to avoid updating if not necessary
        }
        setTimeout(this.checkChaptersUpdates.bind(this), 60 * 1000) // check every minutes
    }
    /**
     * Check if we need to refresh mirrors lists according to frequency every minutes
     */
    checkMirrorsUpdates() {
        let lastUpdt = window["AMR_STORE"].state.options.lastMirrorsUpdate
        let frequency = window["AMR_STORE"].state.options.updatemg
        if (navigator.onLine && lastUpdt + frequency < Date.now()) {
            // time to refresh !
            window["AMR_STORE"].dispatch("updateMirrorsLists")
            this.checkLatestPublishedVersion()
        }
        setTimeout(this.checkMirrorsUpdates.bind(this), 60 * 1000) // check every minutes
    }

    /**
     * Check latest version of stable and beta and keep it in localStorage
     */
    async checkLatestPublishedVersion() {
        let vstable = await this.getVersionFromChromeUpdateFile("https://amr-releases.com/versions/chrome.xml"),
            vbeta = await this.getVersionFromChromeUpdateFile("https://amr-releases.com/versions/chrome-beta.xml")
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
        let nbnew = window["AMR_STORE"].getters.nbNewMangas
        if (window["AMR_STORE"].state.options.nocount == 1) {
            iconHelper.resetBadge() // remove badge
            // display a grey badge if no new mangas
            if (nbnew > 0) iconHelper.resetIcon()
            else iconHelper.setBWIcon()
        } else {
            iconHelper.resetIcon()
            if (window["AMR_STORE"].state.options.displayzero === 1) {
                iconHelper.updateBadge(nbnew)
            } else {
                if (nbnew == 0) iconHelper.resetBadge()
                else iconHelper.updateBadge(nbnew)
            }
        }
    }
}

export default new Updater()
