import browser from "webextension-polyfill"
import Vue from "vue"
import Vuex from "vuex"
import mangas from "./modules/mangas"
import mirrors from "./modules/mirrors"
import options from "./modules/options"
import bookmarks from "./modules/bookmarks"
import importexport from "./modules/importexport"
import VuexMutationSharer from "./sharer/VuexMutationSharer"
Vue.use(Vuex)

/**
 * This store exposes the object to vue (both in popup and background)
 * Each modification of these object must use mutations so it is propagated
 * In background, the store is initialized from the database.
 * In popup and other pages, the store is initialized through a background message which returns the
 * required entries in the store
 * Every instance of the store is kept synchronized with the others using vuex-shared-mutations which
 * triggers events in the different environments through localStorage
 */
export default new Vuex.Store({
    modules: {
        mangas,
        mirrors,
        options,
        bookmarks,
        importexport
    },
    plugins: [
        // share the state for every mutation
        VuexMutationSharer({ predicate: () => true })
    ],
    actions: {
        /**
         * Retrieve current state from reference store (background store)
         * This action is called in pages to init the store
         * @param {*} param0
         * @param {*} param1
         */
        async getStateFromReference({ commit }, { module, key, mutation }) {
            return new Promise(async (resolve, reject) => {
                await browser.runtime
                    .sendMessage({ action: "vuex_initstate", module: module, key: key })
                    .then(async object => {
                        await commit(mutation, object)
                        resolve()
                    })
                    .catch(e => {
                        console.error(e, "getStateFromReference")
                        reject(e)
                    })
            })
        }
    }
})
