import storedb from '../../amr/storedb'
import Axios from 'axios'
import * as utils from '../../amr/utils'

/**
 *  initial state of the mirrors module
 */
const state = {
    /**
     * List of mirrors
     */
    all: []
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
    countMirrors: (state) => {
        return state.all.length;
    },
    /**
     * List of activated mirrors
     */
    activatedMirrors: (state) => {
        return state.all.filter(mirror => mirror.activated);
    }
}

// actions
const actions = {
    /**
     * Get mirrors from local database, fetch it from repository if empty
     * @param {*} param0 
     */
    async initMirrors({ commit, dispatch, rootState }) {
        let websites = await storedb.getWebsites(); // Get mirrors from local database
        if (!websites.length) {
            // No mirrors known yet, get the list
            // Try all repos --> first to work wins.
            for (let repo of rootState.options["impl-repositories"]) {
                let ws = await Axios.get(repo + "websites.json");
                if (ws && ws.data) {
                    let updts = []
                    for (let w of ws.data) {
                        w.activated = true;
                        updts.push(dispatch("updateMirror", w));
                    }
                    Promise.all(updts); // do not wait that all implementations are in db... few seconds. if we need to wait for it, just add await in front of Promise.all
                    websites = ws.data;
                }
            }
        }
        if (!websites.length) {
            document.dispatchEvent(new CustomEvent("mirrorsError"));
        } else {
            commit('setMirrors', websites);
            document.dispatchEvent(new CustomEvent("mirrorsLoaded"));
        }
    },
    /**
     * Update a mirror in the store
     * @param {*} param0 
     * @param {*} manga 
     */
    async updateMirror({ commit }, mirror) {
        utils.debug("update description of " + mirror.mirrorName + " --> " + mirror.webSites + " in db");
        await storedb.storeWebsite(mirror);
    },

    // update mirrors from repository
    updateFromRepo() {
        // TODO
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
        state.all = mirrors
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}