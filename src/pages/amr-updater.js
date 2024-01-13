/**
 * This class is used to update periodically manga chapters lists and mirrors list
 */
export class AmrUpdater {
    /**
     *
     * @param store {AppStore}
     * @param optionStorage {OptionStorage}
     * @param logger {AppLogger}
     */
    constructor(store, optionStorage, logger) {
        this.optionStorage = optionStorage
        this.store = store
        this.logger = logger
    }

    /**
     * Check if we need to refresh chapters lists according to frequency every minutes
     */
    async checkChaptersUpdates() {
        if (!navigator.onLine) {
            return // offline, skip
        }

        const { lastChaptersUpdate, updatechap } = this.store.state.options
        const nextUpdateTs = lastChaptersUpdate + updatechap
        const now = Date.now()

        // Check within the second, to avoid waiting for the next alert check (1 min)
        const shouldUpdate = Math.round(nextUpdateTs / 1000) <= Math.round(now / 1000)
        if (!shouldUpdate) {
            const next = Math.floor((nextUpdateTs - now) / 1000)
            this.logger.debug(`Skipping checkChaptersUpdates, next update can start in ${next}s`)
            return
        }

        // time to refresh ! force=false to avoid updating if not necessary
        return this.store.dispatch("updateChaptersLists", { force: false })
    }

    /**
     * Check if we need to refresh mirrors lists according to frequency every minutes
     */
    checkMirrorsUpdates() {
        const lastUpdt = this.store.state.options.lastMirrorsUpdate
        const frequency = this.store.state.options.updatemg
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
        const baseUrl = "https://amr-releases.com/versions"
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
            const m = regex.exec(res.data)
            if (m) {
                return { version: m[3], url: m[1] }
            }
        }
    }
}
