import browser from "webextension-polyfill"
import { AppStore } from "../types/common"
import { amrLanguages } from "../constants/language"
import { OptionStorage } from "../shared/OptionStorage"
import { AppLogger } from "../shared/AppLogger"

export class AmrInit {
    constructor(
        private store: AppStore,
        private storedb: any,
        private optionStorage: OptionStorage,
        private logger: AppLogger
    ) {}

    public async init() {
        const manifest = browser.runtime.getManifest()

        const ancVersion = await this.optionStorage.getKey("version")
        const curVersion = manifest.version

        let beta = manifest.name.indexOf("Beta") > 0

        let afterLoading = () => {}
        await this.optionStorage.setKey("beta", beta ? 1 : 0)

        if (!ancVersion || curVersion !== ancVersion) {
            await this.optionStorage.setKey("version", curVersion)
            if (!ancVersion) {
                afterLoading = await this.installApp(curVersion)
            } else {
                afterLoading = await this.updateApp(ancVersion, curVersion)
            }
        }

        const nameParts = ["All Mangas Reader"]
        if (beta) {
            nameParts.push("Beta")
        }
        nameParts.push(curVersion)

        browser.action.setTitle({ title: nameParts.join(" ") })

        return afterLoading
    }

    private async updateApp(ancVersion, curVersion) {
        let afterCalls = []
        if (!this.versionAfter(ancVersion, "2.0.2.140")) {
            // if previous version is before 2.0.2.140
            // from this version, mirrors are hosted to mirrors.allmangasreader.com/v4
            // update localStorage to change stored url if necessary
            this.logger.info("Update main repository url to v4")
            await this.store.dispatch("updateRepository", {
                old_repo: "https://mirrors.allmangasreader.com/v3/",
                new_repo: "https://mirrors.allmangasreader.com/v4/"
            })
            this.logger.info("Reinitialize mirrors entries")
            // request an update of mirrors lists
            this.store.dispatch("updateMirrorsLists")
        }
        if (!this.versionAfter(ancVersion, "2.0.2.150")) {
            // if previous version is before 2.0.2.150
            // check if user language is in readable list of languages add it if not
            this.checkLangSet()
            // change category names New, Read, Unread and One Shots to the new ones (codes to be internationalized)
            await this.store.dispatch("updateCategoryName", { oldname: "New", newname: "category_new" })
            await this.store.dispatch("updateCategoryName", { oldname: "Read", newname: "category_read" })
            await this.store.dispatch("updateCategoryName", { oldname: "Unread", newname: "category_unread" })
            await this.store.dispatch("updateCategoryName", { oldname: "One Shots", newname: "category_oneshots" })
            // create languages categories
            afterCalls.push(async () => {
                await this.store.dispatch("updateLanguageCategories")
            })
        }
        if (!this.versionAfter(ancVersion, "2.0.4")) {
            // if previous version is before 2.0.3
            afterCalls.push(async () => {
                let todel = []
                let mgs = await this.storedb.getMangaList()
                for (let mg of mgs) {
                    let sl = mg.key.indexOf("/")
                    let mirrorpart = mg.key.substring(0, sl)
                    if (!mirrorpart.match(/^[0-9a-z]+$/)) {
                        todel.push(mg.key)
                    }
                }
                for (let td of todel) {
                    this.logger.info("deleting manga key " + td + " from db due to 2.0.3 issue")
                    this.storedb.deleteManga(td)
                }
                // reloads mangas
                this.logger.info("Reloading mangas after running db update")
                await this.store.dispatch("initMangasFromDB")
            })
        }
        if (this.versionAfter(ancVersion, "2.3.11")) {
            // Just checking if it exists for those who skip versions of AMR
            afterCalls.push(async () => {
                if (!this.store.state.options.categoriesStates.find(cat => cat.name === "category_disabled_mirrors")) {
                    await this.store.dispatch("addNativeCategory", "category_disabled_mirrors")
                }
            })
        }

        /**
         * Return a function wrapping all functions to call once all db is initialized
         */
        return async () => {
            for (let func of afterCalls) {
                await func()
            }
        }
    }

    /**
     * Compare two software version numbers (e.g. 1.7.1)
     * Returns:
     *
     *  0 if they're identical
     *  negative if v1 < v2
     *  positive if v1 > v2
     *  Nan if they in the wrong format
     *
     *  E.g.:
     *
     *  assert(version_number_compare("1.7.1", "1.6.10") > 0);
     *  assert(version_number_compare("1.7.1", "1.7.10") < 0);
     *
     *  "Unit tests": http://jsfiddle.net/ripper234/Xv9WL/28/
     *
     *  Taken from http://stackoverflow.com/a/6832721/11236
     */
    compareVersionNumbers(v1: string, v2: string) {
        const v1parts = v1.split(".")
        const v2parts = v2.split(".")

        // First, validate both numbers are true version numbers
        function validateParts(parts) {
            for (var i = 0; i < parts.length; ++i) {
                if (!isPositiveInteger(parts[i])) {
                    return false
                }
            }
            return true
        }
        if (!validateParts(v1parts) || !validateParts(v2parts)) {
            return NaN
        }

        for (var i = 0; i < v1parts.length; ++i) {
            if (v2parts.length === i) {
                return 1
            }

            if (v1parts[i] === v2parts[i]) {
                continue
            }
            if (v1parts[i] > v2parts[i]) {
                return 1
            }
            return -1
        }

        if (v1parts.length != v2parts.length) {
            return -1
        }

        return 0
    }

    /**
     * Test if a version is after another
     * return true if version > totest
     */
    versionAfter(version: string, totest: string) {
        return this.compareVersionNumbers(version, totest) > 0
    }

    checkLangSet() {
        let curlang = navigator.language.slice(0, 2)
        // is language supported ? --> pb, sometimes, language code does not match amr code... let it be
        const languages = amrLanguages.reduce((arr, el) => {
            return Array.isArray(el) ? [...arr, ...el] : [...arr, el]
        }, [] as string[])

        if (languages.includes(curlang)) {
            let readLangs = this.store.state.options.readlanguages
            if (!readLangs.includes(curlang)) {
                this.logger.info("Add language " + curlang + " to readable list of languages")
                this.store.dispatch("addReadLanguage", curlang) // add the language
            }
        }
    }

    private async installApp(curVersion) {
        // check if user language is in readable list of languages add it if not
        this.checkLangSet()
        return () => {}
    }
}
