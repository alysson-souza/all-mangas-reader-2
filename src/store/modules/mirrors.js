import storedb from "../../amr/storedb"
import { getMirrorLoader } from "../../mirrors/MirrorLoader"
import { getMirrorHelper } from "../../mirrors/MirrorHelper"

/**
 *  initial state of the mirrors module
 */
const state = {
    /**
     * List of mirrors
     */
    all: [],
    /**
     * List of abstract implementations
     */
    abstracts: []
}

// getters
const getters = {
    /**
     * Return the whole list of mirrors
     */
    allMirrors: state => state.all,
    /**
     * Count mirrors
     */
    countMirrors: state => {
        return state.all.length
    },
    /**
     * List of activated mirrors
     */
    activatedMirrors: state => {
        return state.all.filter(mirror => mirror.activated)
    }
}

// actions
const actions = {
    /**
     * Get mirrors from local database, fetch it from repository if empty
     * @param {*} param0
     */
    async initMirrors({ commit, dispatch }) {
        let websites = await storedb.getWebsites() // Get mirrors from local database

        // No mirrors known yet, get the list
        websites = await dispatch("updateMirrorsLists")

        if (!websites.length) {
            document.dispatchEvent(new CustomEvent("mirrorsError"))
        } else {
            // set mirrors list in store
            commit("setMirrors", websites)
            // set abstract mirrors list in store
            commit("setAbstractMirrors", websites)
        }
    },
    /**
     * Update a mirror in the store
     * @param {*} param0
     * @param {*} manga
     */
    async updateMirror({ commit }, mirror) {
        await storedb.storeWebsite(mirror)
    },

    // update mirrors from repository
    async updateMirrorsLists({ commit, dispatch, rootState }) {
        // update last update ts
        dispatch("setOption", { key: "lastMirrorsUpdate", value: Date.now() })

        let websitesdb = await storedb.getWebsites()
        if (websitesdb === undefined) websitesdb = []

        const mirrorLoader = getMirrorLoader(getMirrorHelper(rootState.options))
        const websites = mirrorLoader.getAll()

        const updts = []
        for (const w of websites) {
            // get activated property in db, do not overright it
            let act = true
            // languages is undefined for abstract implementations --> always activated
            if (w.languages !== undefined && rootState.options["deactivateunreadable"]) {
                const langs = w.languages.split(",")
                let hasReadable = false
                for (const l of langs) {
                    if (rootState.options["readlanguages"].includes(l)) {
                        hasReadable = true
                        break
                    }
                }
                if (!hasReadable) act = false // default activation to false for a new implementation that does not match a readable language if option is checked
            }
            const wdb = websitesdb.find(m => m.mirrorName === w.mirrorName)
            if (wdb != undefined) act = wdb.activated

            // Komga shit
            if (w.mirrorName == "Komga") {
                w.home = rootState.options.komgaUrl
            }
            // tachidesk shit
            if (w.mirrorName == "Tachidesk") {
                w.home = rootState.options.tachideskUrl
            }

            w.activated = act
            updts.push(
                dispatch("updateMirror", w).catch(e => e) // avoid blocking the Promise.all due to an update failure
            )
        }
        // do not wait that all implementations are in db... few seconds. as the stores have been updated instantly, we do not need to wait for it to be in db
        Promise.all(updts)

        if (!websites.length) {
            // hum should not happen now :)
            document.dispatchEvent(new CustomEvent("mirrorsError"))
        } else {
            // set mirrors list in store
            commit("setMirrors", websites)
            // set abstract mirrors list in store
            commit("setAbstractMirrors", websites)
        }

        // remove deleted mirrors
        // TODO --> what do we do if there are mangas in list from these mirrors ?

        return websites
    },
    /**
     * Reset mirrors manga lists from db
     * @param {*} param0
     */
    async resetMirrorsMangaLists({ commit, dispatch, rootState }) {
        await storedb.deleteAllListOfManga()
    },
    /**
     * Set the activated / deactivated flag on a mirror
     * @param {*} param0
     * @param {*} mirror
     */
    changeMirrorActivation({ commit, dispatch, rootState }, mirror) {
        commit("changeMirrorActivation", mirror)
        dispatch("updateMirror", mirror)
    }
}

/**
 * All possible mutations on mirrors objects
 * It is very important to write a mutation each time we need to update or create fields on a mirror object.
 * This way, mutations are propagated in the different instances of the store.
 * If not, some modifications can be not reflected and not saved to the database.
 * A mutation MUST be a synchrone function
 */
const mutations = {
    /**
     * Set the list of mirrors in the store
     * @param {*} state
     * @param {*} mirrors
     */
    setMirrors(state, mirrors) {
        state.all = []
        state.all.push(...mirrors.filter(mirror => mirror.type !== "abstract"))
    },
    /**
     * Set the list of abstract mirrors in the store
     * Only call this commit with a mirror list coming from db, not from another
     * thread mirror list because it does not contains the abstract mirrors
     * @param {*} state
     * @param {*} mirrors
     */
    setAbstractMirrors(state, mirrors) {
        state.abstracts = []
        state.abstracts.push(...mirrors.filter(mirror => mirror.type === "abstract"))
    },

    /**
     * Set the activated / deactivated flag on a mirror
     * @param {*} state
     * @param {*} mirror
     */
    changeMirrorActivation(state, mirror) {
        const mir = state.all.find(m => m.mirrorName === mirror.mirrorName)
        if (mir !== undefined) {
            mir.activated = mirror.activated
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
