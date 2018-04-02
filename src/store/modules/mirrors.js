import storedb from '../../amr/storedb'
import Axios from 'axios'
import * as utils from '../../amr/utils'
import iconHelper from '../../amr/icon-helper';
import mirrorsImpl from '../../amr/mirrors-impl';

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
    async initMirrors({ commit, dispatch }) {
        let websites = await storedb.getWebsites(); // Get mirrors from local database
        if (!websites.length) {
            // No mirrors known yet, get the list
            websites = await dispatch("updateMirrorsLists");
        }
        if (!websites.length) {
            document.dispatchEvent(new CustomEvent("mirrorsError"));
        } else {
            // set mirrors list in store
            commit('setMirrors', websites);
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
    async updateMirrorsLists({ commit, dispatch, rootState }) {
        // set the blue badge
        iconHelper.setBlueIcon();

        // update last update ts
        dispatch("setOption", {key: "lastMirrorsUpdate", value: new Date().getTime()});
                
        let websites = [];
        let config = {	
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control' : 'no-cache'
            }
        };

        // Try all repos --> first to work wins.
        for (let repo of rootState.options["impl_repositories"]) {
            utils.debug("loading from repository " + repo);
            let ws = await Axios.get(repo + "websites.json", config).catch(e => {
                utils.debug("Failed to load websites.json from repo " + repo);
                return e;
            });
            if (ws && ws.data) {
                let updts = []
                for (let w of ws.data) {
                    w.activated = true;
                    updts.push(
                        dispatch("updateMirror", w).catch(e => e) // avoid blocking the Promise.all due to an update failure
                    );
                }
                // do not wait that all implementations are in db... few seconds. as the stores have been updated instantly, we do not need to wait for it to be in db
                Promise.all(updts); 
                websites = ws.data;
            }
        }
        if (!websites.length) {
            document.dispatchEvent(new CustomEvent("mirrorsError"));
        } else {
            // set mirrors list in store
            commit('setMirrors', websites);
        }
        // reset implementations
        mirrorsImpl.resetImplementations();

        //update badges and icon state
        iconHelper.resetIcon();

        return websites;
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