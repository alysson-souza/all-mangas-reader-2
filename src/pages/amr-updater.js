import browser from "webextension-polyfill"

/**
 * This class is used to update periodically manga chapters lists and mirrors list
 */
export class AmrUpdater {
    /**
     *
     * @param store {AppStore}
     * @param optionStorage {OptionStorage}
     * @param iconHelper {IconHelper}
     */
    constructor(store, optionStorage, iconHelper) {
        this.optionStorage = optionStorage
        this.store = store
        this.iconHelper = iconHelper
    }

    /**
     * Initialize refresh checkers
     */
    load() {
        browser.alarms.onAlarm.addListener(alarm => {
            switch (alarm.name) {
                case "checkChaptersUpdates":
                    return this.checkChaptersUpdates()
                case "checkMirrorsUpdates":
                    return this.checkMirrorsUpdates()
                default:
                    console.error(`Received unknown alarm "${alarm.name}"`)
            }
        })
        browser.alarms.create("checkChaptersUpdates", { delayInMinutes: 0.1, periodInMinutes: 1 })
        browser.alarms.create("checkMirrorsUpdates", { delayInMinutes: 0.1, periodInMinutes: 1 })
    }

    /**
     * Check if we need to refresh chapters lists according to frequency every minutes
     */
    async checkChaptersUpdates() {
        const { lastChaptersUpdate, updatechap } = this.store.state.options
        const nextUpdateTs = lastChaptersUpdate + updatechap
        if (navigator.onLine && nextUpdateTs < Date.now()) {
            // time to refresh !
            this.store.dispatch("updateChaptersLists", { force: false }) // force to false to avoid updating if not necessary
        }
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
    }

    /**
     * Check latest version of stable and beta and keep it in localStorage
     */
    async checkLatestPublishedVersion() {
        const baseUrl = "https://release.allmangasreader.com/update"
        const [stable, beta] = await Promise.all([
            this.getVersionFromChromeUpdateFile(`${baseUrl}/chrome.xml`),
            this.getVersionFromChromeUpdateFile(`${baseUrl}/chrome-beta.xml`)
        ])

        if (stable) {
            this.optionStorage.setKey("latestStableVersion", stable.version)
        }
        if (beta) {
            this.optionStorage.setKey("latestBetaVersion", beta.version)
        }
    }

    async getVersionFromChromeUpdateFile(url) {
        const res = await fetch(url, {
            headers: {
                "Cache-Control": "no-cache"
            }
        })
            .then(r => r.text())
            .catch(e => {
                console.error("Failed to load " + url)
                console.error(e)
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
